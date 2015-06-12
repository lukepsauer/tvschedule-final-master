class TVSchedule < Sinatra::Base
  get '/api/time/now' do
    t = Time.now
    {:hours => t.hour, :mins => t.min, :secs => t.sec}.to_json
  end

  get '/api/schedule/today' do
    redirect '/api/schedule/' + url_date(Time.now)
  end

  get '/api/schedules' do
    days=Day.all()

    days.to_json
  end

  get '/api/periods/:s_id' do
    periods=Period.all(:period_id => params[:s_id])
    {
        :schedule_id      => params[:s_id],
        :schedule_version => Schedule.get(:id => params[:s_id]).version,
        :periods          => periods
    }.to_json

  end

  get '/api/schedule/:uid' do
    content_type :json
    schedule   = Schedule.first(:uid_version => params[:uid])
    newPeriods = schedule.periods.map do |per|
      if per.lunch.length > 0
        per.lunch.map do |lunch|
          lunch[:lunch] = lunch[:name].to_s
          lunch[:name]  = per[:name]
          lunch
        end
      else
        per.attributes.merge({:lunch => "-1"})
      end
    end
    {:schedules => [schedule.attributes.merge({:periods => newPeriods.flatten})]}.to_json
  end

  get '/api/schedules/default' do
    content_type :json
    schedules = Schedule.all(:permanent => true)
    output = []
    new_periods = []
    schedules.each do |schedule|
      new_periods = schedule.periods.map do |per|
        if per.lunch.length > 0
          per.lunch.map do |lunch|
            lunch[:lunch] = lunch[:name].to_s
            lunch[:name]  = per[:name]
            lunch
          end
        else
          per.attributes.merge({:lunch => "-1"})
        end
      end
    output << schedule.attributes.merge({:periods => new_periods.flatten})
    end
    {:schedules => output}.to_json
  end

  get '/api/days/next7' do
    days=Day.all
    content_type :json
    out = []
    days.each do |day|
      # puts day.schedule.uid_version
      out << {:date => day.date, :uid => day.schedule.uid_version}
    end

    {
        :days => out
    }.to_json
  end

  get '/api/days' do
    days = Day.all

    all_events = []
    days.each do |i|
      date=i.date.to_s
      date=date[0]+date[1]+date[2]+date[3]+'-'+date[4]+date[5]+'-'+ date[6]+date[7]
      all_events << {:title => i.schedule.name, :start => date}
    end


    all_events.to_json
  end

  get '/api/info' do
    infos = Info.all(:type => '')

    all_events=[]
    if infos!=nil
      infos.each do |i|
        date=i.date.to_s
        date=date[0]+date[1]+date[2]+date[3]+'-'+date[4]+date[5]+'-'+ date[6]+date[7]

        all_events << {:title => i.period + ' - ' + i.text, :start => date}
      end
    end


    all_events.to_json
  end

  get '/api/schedule/:year/:month/:day' do
    wday = Time.local(params[:year], params[:month], params[:day]).strftime('%A')

    if day = Day.first(:date => string_date(params))
      day.schedule.periods.to_json(:only => [:name, :start_seconds, :end_seconds], :methods => [:lunch])
    elsif default_schedule = Schedule.first(:name => wday)
      default_schedule.periods.to_json(:only => [:name, :start_seconds, :end_seconds], :methods => [:lunch])
    else
      halt({:error => 'There are no schedules for this day.'}.to_json)
    end
  end

  get '/api/info/today' do
    redirect '/api/info/' + url_date(Time.now)
  end

  get '/api/info/:year/:month/:day' do

    ((Info.all(:date => string_date(params)) + Info.all(:date => 'permanent')).to_json(:only => [:id, :text, :type, :period]))
  end

  get '/api/announcement/today' do
    redirect '/api/announcement/' + url_date(Time.now)
  end

  get '/api/announcement/:year/:month/:day' do
    (Announcement.all(:expires.gte => string_date(params)) + Announcement.all(:expires => 'permanent')).to_json(:only => [:id, :title, :body])
  end

  get '/api/pebble' do
    redirect '/api/pebble/30'
  end

  get '/api/pebble/:frequency' do
    o_periods = if day = Day.first(:date => string_date(Time.now))
                  day.schedule.periods
                elsif default_schedule = Schedule.first(:name => Time.now.strftime('%A'))
                  default_schedule.periods
                else
                  halt({:content => 'There is no schedule for today.', :refresh_frequency => '240'}.to_json)
                end

    periods = o_periods.clone.to_a

    periods.map! do |period|
      if period.lunch_waves > 0
        period.lunch.map do |wave|
          # wave[:name].prepend(period[:name] + '_')
          # wave
          wave[:name] = period[:name] + %w(⁰ ¹ ² ³)[wave[:name].to_i]
          wave
        end
      else
        period
      end
    end
    periods.flatten!(1)
    # puts periods.inspect

    def nice_time(seconds)
      Time.local(Time.now.year, Time.now.month, Time.now.day, seconds/3600, (seconds%3600)/60, (seconds%3600)%60).strftime('%l:%M')
    end

    output = if Time.now.sec_from_mid < periods.first[:start_seconds] # before school
               "School has not started. \n"
             elsif Time.now.sec_from_mid > periods.last[:end_seconds] # after school
               "School is over. \n"
             else
               periods.each.with_index.inject('') do |r, (current_period, i)|
                 next_period = periods[i+1]
                 if current_period[:start_seconds] < Time.now.sec_from_mid && Time.now.sec_from_mid < current_period[:end_seconds] # during period
                   r += "#{current_period[:name]} end #{nice_time(current_period[:end_seconds])} \n"
                   r += "#{next_period[:name]} #{nice_time(next_period[:start_seconds])}-#{nice_time(next_period[:end_seconds])}\n" if next_period
                 elsif next_period && current_period[:end_seconds] < Time.now.sec_from_mid && Time.now.sec_from_mid < next_period[:start_seconds] # during passing
                   r += "Pass: #{nice_time(next_period[:start_seconds])} \n"
                   r += "#{next_period[:name]} #{nice_time(next_period[:start_seconds])}-#{nice_time(next_period[:end_seconds])}\n" if next_period
                 end
                 r # inject return
               end
             end

    # puts o_periods.inspect
    output += o_periods.collect(&:name).join(' ') # add the periods

    {:content => output, :refresh_frequency => params[:frequency]}.to_json
  end

  helpers do
    def url_date(t)
      "#{t.strftime('%Y')}/#{t.strftime('%m')}/#{t.strftime('%d')}"
    end

    def string_date(obj)
      if obj.class == Hash
        obj[:year] + obj[:month] + obj[:day]
      else
        obj.strftime('%Y') + obj.strftime('%m') + obj.strftime('%d')
      end
    end
  end
end

class Time
  def sec_from_mid
    self.hour*3600 + self.min*60 + self.sec
  end
end

class TVSchedule < Sinatra::Base
  get '/admin' do
    admin_required
    redirect url('/admin/schedules')
  end

  get '/admin/calendar' do
    admin_required
    erb :calendar, :layout => :admin_layout # HTML
  end

  get '/day/:date' do
    admin_required

    @day = Day.first(:date => params[:date])
    if @day
      @schedule = @day.schedule
    else
      @schedule = Schedule.get(dateObjFromString(params[:date]).cwday)
    end
    @schedules = Schedule.all()
    @periods = @schedule.periods
    @infos = Info.all(:date => params[:date])

    erb :days, :layout => :admin_layout # HTML
  end

  # READ Schedules
  get '/admin/schedules' do
    admin_required
    @schedules = Schedule.all

    erb :schedules, :layout => :admin_layout # HTML
  end

  # CREATE Schedule
  post '/admin/schedule/create' do
    admin_required
    schedule      = Schedule.new
    schedule.name = params[:name]
    schedule.save

    schedule.to_json # JSON
  end

  # UPDATE Schedule
  post '/admin/schedule/:sid/update' do
    admin_required
    schedule      = Schedule.get(params[:sid])
    halt 403 if schedule.permanent
    schedule.name = params[:name]
    schedule.save

    schedule.to_json # JSON
  end

  # DELETE Schedule
  post '/admin/schedule/:sid/delete' do
    admin_required
    @schedule = Schedule.get(params[:sid])
    halt 403 if @schedule.permanent
    puts "destroying #{@schedule.inspect}"
    puts @schedule.destroy # BOOLEAN
    puts @schedule.errors.inspect
  end

  # READ Lunch Schedules
  get '/admin/lunch' do
    admin_required
    @lunches = Info.all(:type => ['1', '2', '3'])

    erb :lunch, :layout => :admin_layout # HTML
  end

  # CREATE Lunch Schedules
  post '/admin/lunch/create' do
    admin_required
    schedule      = Schedule.new
    schedule.name = params[:name]
    schedule.save

    schedule.to_json # JSON
  end

  # UPDATE Lunch Schedules
  post '/admin/lunch/:sid/update' do
    admin_required
    schedule      = Schedule.get(params[:sid])
    schedule.name = params[:name]
    schedule.save

    schedule.to_json # JSON
  end

  # DELETE Lunch Schedules
  post '/admin/lunch/:sid/delete' do
    admin_required
    @schedule = Schedule.get(params[:sid])

    @schedule.destroy! # BOOLEAN
  end

  post '/admin/day/:date/update' do
    admin_required
    day             = Day.first_or_create({:date => params[:date]}, {:schedule_id => params[:schedule_id]})
    day.schedule_id = params[:schedule_id]
    day.save
    redirect '/admin/calendar'
  end

  get '/admin/day/:date/remove' do
    admin_required
    day = Day.first(:date => params[:date])
    day.destroy
    redirect '/admin/calendar'
  end

  get '/admin/lunches/update' do
    @lunch1= Info.get(1)
    @lunch2= Info.get(2)
    @lunch3= Info.get(3)
    @lunches=params[:lunches]
    puts @lunches
    @lunch1.text=@lunches.split('-')[0]
    @lunch2.text=@lunches.split('-')[1]
    @lunch3.text=@lunches.split('-')[2]
    @lunch1.save
    @lunch2.save
    @lunch3.save
  end

  post '/admin/day/:date/period/addAnnc' do
    admin_required
    info        = Info.new
    info.type   = ''
    info.date   = params[:date]
    info.period = params[:period]
    info.text   = params[:text]
    info.save
    redirect '/admin/calendar'
  end

  get '/admin/info/delete/:id' do
    admin_required
    info = Info.get(params[:id])
    date=info.date
    info.destroy!
    redirect '/day/'+date
  end
end
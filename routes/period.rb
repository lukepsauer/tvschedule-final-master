class TVSchedule < Sinatra::Base
  # READ Periods
  get '/admin/schedule/:sid/periods' do
    admin_required
    @schedule = Schedule.get(params[:sid])

    erb :periods, :layout => :admin_layout # HTML
  end

  # CREATE Period
  post '/admin/schedule/:sid/period/create' do
    admin_required
    schedule = Schedule.get(params[:sid])
    period = schedule.periods.new
    period.name = params[:name]
    period.start_seconds = Chronic.parse(params[:start]).sec_from_mid
    period.end_seconds = Chronic.parse(params[:end]).sec_from_mid
    period.lunch_waves = params[:lunch_waves].to_i
    period.save

    period.to_json(:methods => [:start_string, :end_string]) # JSON
  end

  # UPDATE Period
  post '/admin/schedule/:sid/period/:pid/update' do
    admin_required
    period = Period.get(params[:pid])
    period.name = params[:name]
    period.start_seconds = Chronic.parse(params[:start]).sec_from_mid
    period.end_seconds = Chronic.parse(params[:end]).sec_from_mid
    period.lunch_waves = params[:lunch_waves].to_i
    period.save

    period.to_json(:methods => [:start_string, :end_string]) # JSON
  end

  # DELETE Period
  post '/admin/schedule/:sid/period/:pid/delete' do
    admin_required
    period = Period.get(params[:pid])

    period.destroy! # BOOLEAN
  end
end
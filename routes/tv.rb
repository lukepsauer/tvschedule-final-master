class TVSchedule < Sinatra::Base
  get '/' do
    if session[:schoology] == nil
      erb :responsive, :layout => false
    else
      erb :user, :layout => false
    end
  end

  get '/tv' do
    erb :tv
  end

  get '/cable' do
    erb :cable
  end
  get '/login/user' do
    redirect '/user'
  end

  get '/user' do
    @assignments = {Date.today => [ "Do the page", "Do the Other"]*10}
    @assignments[Date.parse('2015-1-1')] = [ "Do the page", "Do the Other"]*10
    @assignments[Date.parse('2015-1-13')] = [ "Do the page", "Do the Other"]*10
    @assignments[Date.parse('2015-1-12')] = [ "Do the page", "Do the Other"]*10
    @classes = {'1' => "English", '2' => "English", '3' => "English", '4' => "English", '5' => "English", '6' => "English", '7' => "Englishsdfsdfgsdfg", '8' => "English"}
    erb :user, :layout => false
  end
end
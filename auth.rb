class TVSchedule < Sinatra::Base
  get '/login' do
    redirect '/auth/google'
  end

  %w(get post).each do |method|
    send(method, '/auth/:provider/callback') do
      info = request.env['omniauth.auth'].info.to_hash

      halt 500 unless info['email']

      halt 403, 'You must have a valid account issued by the Westport Public Schools to use this site' unless /^([a-z]{2}\d{5,7}@students.|[a-z]{3,}@)westport.k12.ct.us$/ =~ info['email']

      unless user = User.first(:email => info['email'])
        user = User.new
        user.email = info['email']
      end

      halt 500 unless user.save

      user.generate_token
      session[:user] = user.token

      flash[:success] = 'You have successfully logged in!'
      redirect url('/admin')
    end
  end

  get '/auth/failure' do
    session.clear

    flash[:error]  = 'Authentication error occurred.'
    redirect url('/')
  end

  get '/auth/logout' do
    session.clear

    flash[:info]   = 'Successfully logged out.'
    redirect url('/')
  end

  helpers do
    include Rack::Utils
    alias_method :h, :escape_html

    # Require login to view page
    def login_required
      if current_user
        return true
      else
        redirect '/login'
        return false
      end
    end

    def admin_required
      if is_admin?
        return true
      else
        redirect '/login'
        return false
      end
    end

    def is_admin?
      return (current_user && ADMIN_USERS.include?(current_user.email))
    end

    # Return current_user record if logged in
    def current_user
      return @current_user ||= User.first(:token => session[:user])
    end
  end
end
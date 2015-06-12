# READ Announcements
class TVSchedule < Sinatra::Base
  get '/admin/announcements' do
    admin_required
    @announcements = Announcement.all

    erb :announcements, :layout => :admin_layout # HTML
  end

  post '/admin/announcement/create' do
    admin_required
    announcement = Announcement.new
    announcement.title = params[:title]
    announcement.body = params[:body]
    if params[:expires] && params[:expires] != ''
      announcement.expires = params[:expires].split('/')[2]+params[:expires].split('/')[0]+params[:expires].split('/')[1]
    else
      announcement.expires = Time.now.strftime('%Y%m%d')
    end
    announcement.save

    announcement.to_json # JSON
  end

  # UPDATE announcement
  post '/admin/announcement/:sid/update' do
    admin_required
    announcement = Announcement.get(params[:sid])
    announcement.title = params[:title]
    announcement.body = params[:body]
    announcement.expires = params[:expires].split('/')[2]+params[:expires].split('/')[0]+params[:expires].split('/')[1]
    announcement.save

    announcement.to_json # JSON
  end

  # DELETE announcement
  post '/admin/announcement/:sid/delete' do
    admin_required



    @announcement = Announcement.get(params[:sid])

    @announcement.destroy! # BOOLEAN
  end
end
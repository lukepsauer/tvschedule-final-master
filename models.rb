class Period
  include DataMapper::Resource

  property :id, Serial, :key => true
  property :name, String
  property :start_seconds, Integer # seconds from midnight
  property :end_seconds, Integer # seconds from midnight
  property :lunch_waves, Integer, :default => 0

  def start_string
    Time.local(Time.now.year, Time.now.month, Time.now.day, self.start_seconds/3600, (self.start_seconds%3600)/60, (self.start_seconds%3600)%60).strftime('%l:%M %p')
  end

  def end_string
    Time.local(Time.now.year, Time.now.month, Time.now.day, self.end_seconds/3600, (self.end_seconds%3600)/60, (self.end_seconds%3600)%60).strftime('%l:%M %p')
  end

  def lunch
    return [] if self.lunch_waves == 0

    wave_passing = 5*60
    wave_length = (self.end_seconds - self.start_seconds - wave_passing*(self.lunch_waves-1)) / self.lunch_waves
    waves = []
    self.lunch_waves.times do |i|
      wave_start_seconds = self.start_seconds + (wave_length * i) + (wave_passing * i)
      wave_end_seconds = wave_start_seconds + wave_length
      waves << {:name => (i+1).to_s, :start_seconds => wave_start_seconds, :end_seconds => wave_end_seconds}
    end
    waves # return
  end

  belongs_to :schedule
end

class Day
  include DataMapper::Resource

  property :id, Serial, :key => true
  property :date, String

  belongs_to :schedule
end

class Announcement
  include DataMapper::Resource

  property :id, Serial, :key => true
  property :title, String
  property :body, Text
  property :expires, String
end

class Info
  include DataMapper::Resource

  property :id, Serial, :key => true
  property :text, Text
  property :type, String
  property :period, String
  property :date, String #YYYYMMDD
end

class Schedule
  include DataMapper::Resource

  property :id, Serial, :key => true
  property :name, String
  property :permanent, Boolean, :default => false
  property :uid_version, String

  has n, :days
  has n, :periods

  before :save do
    self.uid_version=UUID.new.generate
  end

  before :destroy do
    puts 'destroying'
    #self.days.each { |e| e.destroy }
    #self.periods.each { |e| e.destroy }
  end
end

class User
  include DataMapper::Resource

  property :id, Serial
  property :email, String, :required => true, :unique => true, :format => /^([a-z]{2}\d{5,7}@students.|[a-z]{3,}@)westport.k12.ct.us$/
  property :token, String
  property :created_at, EpochTime
  property :admin, Boolean, :default => false
  property :class1, String
  property :class2, String
  property :class3, String
  property :class4, String
  property :class5, String
  property :class6, String
  property :class7, String
  property :class8, String
  property :classType1, Integer, :default => 0
  property :classType2, Integer, :default => 0
  property :classType3, Integer, :default => 0
  property :classType4, Integer, :default => 0
  property :classType5, Integer, :default => 0
  property :classType6, Integer, :default => 0
  property :classType7, Integer, :default => 0
  property :classType8, Integer, :default => 0


  before :create do
    self.token = SecureRandom.hex
  end

  def generate_token
    self.update!(:token => SecureRandom.hex)
  end
end

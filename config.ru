require 'rubygems'
require 'bundler'

Bundler.require
require 'json'
require 'date'

require './app.rb'

# Auth Routes
ADMIN_USERS = %w( ndewey@westport.k12.ct.us ad46363@students.westport.k12.ct.us ls49540@students.westport.k12.ct.us ps47366@students.westport.k12.ct.us ascheetz@westport.k12.ct.us jphoneycutt@westport.k12.ct.us )
require './auth.rb'

# Routes
Dir['./routes/*.rb'].each {|file| require file }

# Models
DataMapper.setup(:default, ENV['DATABASE_URL'] || "sqlite://#{Dir.pwd}/db/development.db")
require './models.rb'
DataMapper.finalize
DataMapper.auto_upgrade!
#DataMapper.auto_migrate!
#require './seed.rb'

run TVSchedule

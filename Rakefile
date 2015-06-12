require 'rubygems'
require 'bundler'

Bundler.require
require 'json'
require 'date'

task :reseed do
  puts 'RE-Seeding the Database.'
  puts '!!! THIS WILL DESTROY ALL RECORDS !!!'
  response = ''
  while response != 'Y' and response != 'n'
  puts 'do you wish to proceed? Y/n'
    response = STDIN.gets.chomp
  end
  if response == 'n'
    raise 'Task aborted.'
  end
  puts 'Re-Seeding'
  DataMapper.setup(:default, ENV['DATABASE_URL'] || "sqlite://#{Dir.pwd}/db/development.db")
  require './models.rb'
  DataMapper.finalize
  DataMapper.auto_migrate!
  require './seed.rb'
  puts 'Done'
end
# Configure Sinatra as a Rack app

require 'rubygems'
require 'bundler'

# require dependencies from Gemfile
Bundler.require

require './app'

run Sinatra::Application

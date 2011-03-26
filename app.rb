ROOT = File.dirname(__FILE__)

set :public, "./public"
set :views, File.join(ROOT, "views")
enable :static
enable :sessions

##
# Home handler, render /views/home.erb
#
get '/' do
  haml :app
end

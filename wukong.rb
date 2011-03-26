require 'rubygems'
require 'bundler'
require 'csv'

Bundler.require

require './lib/zip_util'

module WordCount
  class Mapper < Wukong::Streamer::LineStreamer
    # Emit each word in the line.
    def process line
      #words = line.strip.split(/\W+/).reject(&:blank?)
      #words.each{|word| yield [word, 1] }
      CSV.parse(line) do |row|
        index = ZipUtil.find_zip_index(row) unless index
        if index && m = row[index].match(ZipUtil::RE)        
          yield [ZipUtil.format(m[1]), 1]
        end
      end
      
    end
  end
  
  class Reducer < Wukong::Streamer::ListReducer
    def finalize      
      yield [key, values.length ]
    end
  end
end

Wukong::Script.new(
  WordCount::Mapper,
  WordCount::Reducer
).run # Execute the script
    
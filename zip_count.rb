require 'rubygems'
require 'mandy'
require 'csv'

require 'lib/zip_util'


Mandy.job "Zip Count" do
  index = nil
    
  map do |line|    
    CSV.parse(line) do |row|
      index = ZipUtil.find_zip_index(row) unless index
      
      if index && m = row[index].match(ZipUtil::RE)        
        emit(ZipUtil.format(m[1]), 1)  
      end
    end
  end
  
  reduce do |zip, count|
    emit(zip, count.size)
  end
end

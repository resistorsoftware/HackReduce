module ZipUtil
  RE = Regexp.new('^([0-9]{5}|[0-9]{4})(?:[-\s]*([0-9]{4}|[0-9]{3}))?$')
  
  def self.find_zip_index(row)
    index = nil
    row.each do |col|       
      if col && col.match(RE)  
        index = row.index(col)
        break
      end
    end
    index
  end
  
  def self.format(zip)
    (5 - zip.length).times do
      zip = "0#{zip}"
    end
    zip
  end
end
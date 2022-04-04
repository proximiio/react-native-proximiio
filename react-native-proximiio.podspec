require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-proximiio"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "13.0" }
  s.source       = { :git => "https://github.com/proximiio/react-native-proximiio.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m}"

  s.dependency "React"
  s.dependency "Proximiio", "5.2.20"
  s.dependency "ProximiioProcessor", "0.3.0"

end

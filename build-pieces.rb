#!/usr/bin/env ruby

require 'fileutils'
require 'base64'
include FileUtils

lila_dir = pwd()
source_dir = lila_dir + '/assets/piece/'
dest_dir = lila_dir + '/assets/piece-css/'

types = {
  'svg' => 'svg+xml;base64,',
  'png' => 'png;base64,'
}

roles = ['space', 'target', 'wall', 'box', 'char']

# inline SVG

name = 'pixel'
ext = 'png'
classes = roles.map { |role|
  piece = role
  file = source_dir + '/' + piece + '.' + ext
  File.open(file, 'r') do|image_file|
    image = image_file.read
    base64 = Base64.strict_encode64(image)
    '.is2d .' + role + ' {' +
      "background-image:url('data:image/" + types[ext] + base64 + "')}"
  end
}

File.open(dest_dir + name + '.css', 'w') { |f| f.puts classes.join("\n") }

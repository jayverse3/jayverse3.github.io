# Test bridge: exercise the real Markdown converter before the Node renderer.
require 'json'
require 'jekyll'
require_relative '../_plugins/expressive_code'

config = YAML.safe_load_file(File.join(__dir__, '..', '_config.yml'))
converter = Jekyll::Converters::Markdown.new(config)
baseline = Jekyll::Converters::Markdown.new(config.merge('kramdown' => config['kramdown'].merge('input' => 'GFM')))
puts JSON.generate(JSON.parse(STDIN.read).map do |source|
  { html: converter.convert(source), baseline: baseline.convert(source) }
end)

require 'nokogiri'

module BlogReadingTime
  # An estimate, not a timer: count Chinese characters and other words separately.
  # Work from article HTML before KaTeX/Expressive Code add presentation markup.
  def reading_minutes(html)
    fragment = Nokogiri::HTML.fragment(html.to_s)
    fragment.css('script, style, svg, #markdown-toc').remove
    text = fragment.xpath('.//text()').map(&:text).join(' ')
    chinese_characters = text.scan(/\p{Han}/).length
    words = text.gsub(/\p{Han}/, ' ').scan(/[\p{L}\p{N}]+(?:['’_-][\p{L}\p{N}]+)*/).length
    [(chinese_characters / 300.0 + words / 200.0).ceil, 1].max
  end
end

Liquid::Template.register_filter(BlogReadingTime)

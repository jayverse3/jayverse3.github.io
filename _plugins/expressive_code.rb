require 'json'
require 'open3'
require 'kramdown-parser-gfm'

module Kramdown
  module Parser
    # Extend only the fence info string; GFM still handles nesting and all prose.
    class GFMWithCodeMeta < GFM
      # Keep GFM's five capture groups for its inherited fence parser:
      # fence, delimiter, info string, language, code.
      FENCED_CODEBLOCK_MATCH = /^[ ]{0,3}(([~`]){3,})[ \t]*((\S+?)(?:\?\S*)?(?:[ \t]+[^\n]*)?)?[ \t]*\n(.*?)^[ ]{0,3}\1\2*[ \t]*\n/m.freeze

      def parse_codeblock_fenced
        return false unless super

        element = @tree.children.last
        language, meta = element.options[:lang].to_s.split(/[ \t]+/, 2)
        if meta && !meta.empty?
          element.options[:lang] = language
          element.attr['data-ec-meta'] = meta
        end
        true
      end
    end
  end
end

# Use the same post-processing step in local preview and the Pages workflow.
Jekyll::Hooks.register :site, :post_write do |site|
  posts = site.posts.docs.select(&:write?).map do |post|
    { path: post.destination(site.dest), lang: post.data['lang'] || 'en' }
  end
  next if posts.empty?

  payload = { destination: site.dest, baseUrl: site.config.fetch('baseurl', ''), posts: posts }
  output, errors, status = Open3.capture3(
    'node', File.join(site.source, 'scripts/render-code-blocks.mjs'),
    stdin_data: JSON.generate(payload), chdir: site.source
  )
  Jekyll.logger.info 'Expressive Code:', output.strip unless output.empty?
  Jekyll.logger.warn 'Expressive Code:', errors.strip unless errors.empty?
  unless status.success?
    raise Jekyll::Errors::FatalException, 'Code block rendering failed. Run npm ci and check the error above.'
  end
end

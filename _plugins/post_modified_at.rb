require 'open3'
require 'time'

# Populate dates before templates, the feed, and the sitemap read post metadata.
Jekyll::Hooks.register :site, :post_read do |site|
  site.posts.docs.each do |post|
    next if post.data['last_modified_at']

    timestamp, _errors, status = Open3.capture3(
      'git', '--literal-pathspecs', 'log', '-1', '--format=%cI', '--', post.relative_path,
      chdir: site.source
    )
    unless status.success?
      Jekyll.logger.warn 'Post dates:', 'Git history unavailable; automatic modification dates omitted.'
      break
    end

    # Untracked drafts have no commit date; never substitute filesystem/build time.
    next if timestamp.strip.empty?

    post.data['last_modified_at'] = Time.iso8601(timestamp.strip)
  end
rescue Errno::ENOENT, ArgumentError => error
  Jekyll.logger.warn 'Post dates:', "Automatic modification dates unavailable: #{error.message}"
end

# Resolve missing labels once at build time, including nested dictionary keys.
Jekyll::Hooks.register :site, :post_read do |site|
  translations = site.data.fetch('i18n')
  english = translations.fetch('en')

  translations.each do |language, overrides|
    next if language == 'en'

    translations[language] = Jekyll::Utils.deep_merge_hashes(english, overrides)
  end
end

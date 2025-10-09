# _plugins/copy_post_assets.rb
Jekyll::Hooks.register :site, :post_write do |site|
  source_dir = File.join(site.source, "_posts", "assets")
  dest_dir = File.join(site.dest, "assets")

  if Dir.exist?(source_dir)
    FileUtils.mkdir_p(dest_dir)
    FileUtils.cp_r(Dir.glob("#{source_dir}/*"), dest_dir)
    Jekyll.logger.info "✅ Copied _posts/assets → /assets/"
  else
    Jekyll.logger.info "⚠️ No _posts/assets directory found, skipping copy."
  end
end

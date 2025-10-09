# _plugins/default_date.rb
Jekyll::Hooks.register :posts, :pre_render do |post, payload|
  if !post.data['date'] || post.data['date'].nil?
    # 默认日期，例如 2025-01-01
    post.data['date'] = Time.new(2025, 1, 1)
  end
end

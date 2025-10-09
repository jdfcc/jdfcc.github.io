# _plugins/default_date.rb
Jekyll::Hooks.register :posts, :pre_render do |post, payload|
  if post.data['date'].nil?
    post.data['date'] = Time.new(2025, 1, 1)  # 默认时间，可改为 Time.now
  end
end

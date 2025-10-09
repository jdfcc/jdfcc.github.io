Jekyll::Hooks.register :posts, :post_read do |post|
  if !post.data['date'] || post.data['date'].nil?
    post.data['date'] = Time.new(2025, 1, 1)
  end
end

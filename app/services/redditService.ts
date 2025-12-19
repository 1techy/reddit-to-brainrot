interface RedditData {
  title: string;
  text: string;
  author: string;
  subreddit: string;
}

export const extractRedditData = async (redditUrl: string): Promise<RedditData> => {
  try {
    // Add .json to Reddit URL to get JSON data
    const jsonUrl = redditUrl.replace(/\/$/, '') + '.json';

    const response = await fetch(jsonUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch Reddit post. Check the URL.');
    }

    const data = await response.json();
    const post = data[0].data.children[0].data;

    return {
      title: post.title,
      text: post.selftext || 'No text content available.',
      author: post.author,
      subreddit: post.subreddit,
    };
  } catch (error: any) {
    throw new Error(`Reddit Error: ${error.message}`);
  }
};

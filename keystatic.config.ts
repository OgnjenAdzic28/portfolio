import { collection, config, fields } from "@keystatic/core";

export default config({
  storage: {
    kind: "cloud",
  },
  cloud: {
    project: "ognjen-portfolio/portfolio",
  },
  ui: {
    brand: {
      name: "Ognjen Portfolio",
    },
    navigation: {
      Content: ["posts"],
    },
  },
  collections: {
    posts: collection({
      label: "Blog Posts",
      slugField: "title",
      path: "content/posts/*",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({
          name: {
            label: "Title",
            validation: { isRequired: true },
          },
        }),
        publishedDate: fields.date({
          label: "Published Date",
          defaultValue: { kind: "today" },
        }),
        excerpt: fields.text({
          label: "Excerpt",
          description: "A brief description of the post",
          multiline: true,
        }),
        readTime: fields.integer({
          label: "Read Time (minutes)",
          description: "Estimated reading time in minutes",
          defaultValue: 5,
          validation: { min: 1, max: 60 },
        }),
        featured: fields.checkbox({
          label: "Featured Post",
          description: "Show this post prominently on the homepage",
          defaultValue: false,
        }),
        tags: fields.array(
          fields.text({
            label: "Tag",
          }),
          {
            label: "Tags",
            itemLabel: (props) => props.value || "Tag",
          }
        ),
        coverImage: fields.image({
          label: "Cover Image",
          description: "Main image for the blog post",
          directory: "public/images/blog",
          publicPath: "/images/blog/",
        }),
        author: fields.object({
          name: fields.text({
            label: "Author Name",
            defaultValue: "ognjen",
          }),
          avatar: fields.image({
            label: "Author Avatar",
            description: "Author profile picture",
            directory: "public/images/authors",
            publicPath: "/images/authors/",
          }),
        }),
        content: fields.markdoc({
          label: "Content",
          options: {
            image: {
              directory: "public/images/blog",
              publicPath: "/images/blog/",
            },
          },
        }),
      },
    }),
  },
});

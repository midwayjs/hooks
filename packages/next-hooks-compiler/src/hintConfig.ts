export const hintConfig = {
  features: {
    tsc: {
      transformers: [
        {
          name: require.resolve('./plugin/anonymous-function-to-named'),
        },
        {
          name: require.resolve('./plugin/ref-to-bind'),
        },
        {
          name: require.resolve('./plugin/create-lambda'),
        },
        {
          name: require.resolve('./plugin/sourcefile-logger'),
        },
      ],
    },
  },
}

export const hintConfigForAsyncHooks = {
  features: {
    tsc: {
      transformers: [
        {
          name: require.resolve('./plugin/anonymous-function-to-named'),
        },
        {
          name: require.resolve('./plugin/create-lambda'),
        },
        {
          name: require.resolve('./plugin/sourcefile-logger'),
        },
      ],
    },
  },
}

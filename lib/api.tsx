import React from 'react';

import Reddit from '@local/secrets/Reddit'; // NOTE: this is gitignored for obvious reasons

interface Props {
  accessToken: string
}

// baseURL: 'https://oauth.reddit.com',

interface State {
  config: object
}

export default class Client extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
  }

  newRequest() {

  }

  // etc
}

    // const client = new snoowrap({
    //   userAgent: Reddit.userAgent,
    //   clientId: Reddit.clientID,
    //   clientSecret: Reddit.exampleUser.access_token,
    //   refreshToken: Reddit.exampleUser.refresh_token,
    // });

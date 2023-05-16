import { request, gql } from 'graphql-request'

const generator = async (config) => {
  const results = await request(
    'https://api.thegraph.com/subgraphs/name/poap-xyz/poap-xdai',
    gql`
      query Event($eventId: ID!, $first: Int) {
        event(id: $eventId) {
          id
          tokenCount
          created
          tokens(first: $first) {
            id
            transferCount
            created
            owner {
              id
            }
          }
        }
      }
    `,
    {
      eventId: config.eventId
    }
  )

  return [
    ...results.event.tokens.map((token) => {
      return {
        schema: '0xa3866145ae39fb20263674414f85b97c7ed76424a9bccd4d7302bea7d668cda6',
        recipient: token.owner.id,
        data: {
          eventID: results.event.id,
          tokenID: token.id,
          created: parseInt(token.created, 10),
        }
      }
    }),
    {
      schema: '0x283113b00b913ca6657ea4b088f2b926a86f76712c31d6819fbd2335aa61d477',
      recipient: null,
      data: {
        eventID: results.event.id,
        tokenCount: parseInt(results.event.created, 10),
      }
    }
  ]
}

export default generator

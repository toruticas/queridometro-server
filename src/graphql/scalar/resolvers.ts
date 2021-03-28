import { GraphQLDate, GraphQLTime, GraphQLDateTime } from 'graphql-iso-date'

const scalarResolvers = {
  Date: GraphQLDate,
  Time: GraphQLTime,
  DateTime: GraphQLDateTime,
}

export { scalarResolvers }

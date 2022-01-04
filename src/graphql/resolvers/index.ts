import { IResolvers } from '@graphql-tools/utils';
import { merge } from 'lodash';
import { UserResolvers } from './UserResolver';
import { TimezoneResolvers } from './TimezoneResolver';

const resolverMap: IResolvers = merge(UserResolvers, TimezoneResolvers);

export default resolverMap;

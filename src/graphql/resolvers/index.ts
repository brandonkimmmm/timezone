import { IResolvers } from '@graphql-tools/utils';
import { merge } from 'lodash';
import { UserResolvers } from './UserResolver';
import { AdminResolvers } from './AdminResolver';

export const userResolvers: IResolvers = merge(UserResolvers);
export const adminResolvers: IResolvers = merge(AdminResolvers);

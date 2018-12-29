import { GraphQLResolveInfo } from "graphql";
import { DbConnection } from "../../../interfaces/DbConnection";
import { UserInstance } from "../../../models/UserModel";
import { Transaction } from "sequelize";
import { handleError } from "../../../utils/utils";

export const userResolvers = {
    User: {
        posts: (parent, { limit = 10, offset = 0 }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            return db.Post
                .findAll({
                    where: { author: parent.get('id') },
                    limit,
                    offset
                })
                .catch(handleError);
        },
    },

    Query: {
        users: (parent, { limit = 10, offset = 0 }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            return db.User.findAll({
                limit,
                offset
            })
                .catch(handleError);
        },

        user: (parent, { id }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            id = parseInt(id);

            return db.User
                .findByPk(id)
                .then((user: UserInstance | null) => {
                    if (!user) throw new Error(`User with id ${id} not found!`);
                    return user;
                })
                .catch(handleError);
        }
    },

    Mutation: {
        createUser: (parent, { input }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .create(input, { transaction: t });
            })
                .catch(handleError);
        },

        updateUser: (parent, { id, input }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            id = parseInt(id);

            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findByPk(id)
                    .then((user: UserInstance | null) => {
                        if (!user) throw new Error(`User with id ${id} not found!`);
                        return user.update(input, { transaction: t });
                    });
            })
                .catch(handleError);
        },

        updateUserPassword: (parent, { id, input }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            id = parseInt(id);

            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findByPk(id)
                    .then((user: UserInstance | null) => {
                        if (!user) throw new Error(`User with id ${id} not found!`);

                        return user.update(input, { transaction: t })
                            .then((user: UserInstance) => !!user);
                    });
            })
                .catch(handleError);
        },

        deleteUser: (parent, { id, input }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            id = parseInt(id);

            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findByPk(id)
                    .then((user: UserInstance | null) => {
                        if (!user) throw new Error(`User with id ${id} not found!`);
                        return user
                            .destroy({ transaction: t })
                            .then(() => true)
                            .catch(() => false);
                    });
            })
                .catch(handleError);
        }
    }
};
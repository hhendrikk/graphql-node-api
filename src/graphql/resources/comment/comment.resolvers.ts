import { DbConnection } from "../../../interfaces/DbConnection";
import { GraphQLResolveInfo } from "graphql";
import PostModel from "../../../models/PostModel";
import { Transaction } from "sequelize";
import { CommentInstance } from "../../../models/CommentModel";
import { handleError } from "../../../utils/utils";

export const commentResolvers = {
    Comment: {
        post: (comment, args, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            return db.Post
                .findByPk(comment.get('post'))
                .catch(handleError);
        },

        user: (comment, args, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            return db.User
                .findByPk(comment.get('user'))
                .catch(handleError);
        }
    },

    Query: {
        commentsByPost: (comment, { postId, limit = 10, offset = 0 }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            postId = parseInt(postId);

            return db.Comment
                .findAll({
                    where: { post: postId },
                    limit,
                    offset
                })
                .catch(handleError);
        }
    },

    Mutation: {
        createComment: (comment, { input }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment
                    .create(input, { transaction: t });
            }).catch(handleError);
        },

        updateComment: (comment, { id, input }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            id = parseInt(id);

            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment
                    .findByPk(id)
                    .then((comment: CommentInstance | null) => {
                        if (!comment) throw new Error(`Comment with id ${id} not found`);
                        return comment.update(input, { transaction: t });
                    });
            }).catch(handleError);
        },

        deleteComment: (comment, { id }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            id = parseInt(id);

            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment
                    .findByPk(id)
                    .then((comment: CommentInstance | null) => {
                        if (!comment) throw new Error(`Comment with id ${id} not found`);
                        return comment.destroy({ transaction: t })
                            .then(() => true)
                            .catch(() => false);
                    });
            }).catch(handleError);
        },
    }
};
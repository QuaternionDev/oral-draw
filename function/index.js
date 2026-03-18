import { Client, Databases, Query } from "node-appwrite";

export default async ({ req, res, log }) => {
    const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

    const db  = new Databases(client);
    const now = new Date();

    const { documents: sessions } = await db.listDocuments(
        process.env.DATABASE_ID, 'sessions',
        [Query.equal('state', 'open'), Query.lessThanEqual('deadline', now.toISOString())]
    );

    log(`Found ${sessions.length} session(s) to process`);

    for (const session of sessions) {
        const { documents: signups } = await db.listDocuments(
            process.env.DATABASE_ID, 'signups',
            [Query.equal('session_id', session.$id), Query.limit(50)]
        );

        if (signups.length === 0) {
            await db.updateDocument(process.env.DATABASE_ID, 'sessions', session.$id, {
                state: 'failed'
            });
            log(`Session ${session.$id} → failed (no volunteers)`);
        } else {
            const winner = signups[Math.floor(Math.random() * signups.length)];
            await db.updateDocument(process.env.DATABASE_ID, 'sessions', session.$id, {
                state:       'picked',
                winner_id:   winner.user_id,
                winner_name: winner.user_name,
            });
            log(`Session ${session.$id} → picked ${winner.user_name}`);
        }
    }

    return res.json({ ok: true, processed: sessions.length });
};

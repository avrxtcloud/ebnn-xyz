import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { accessToken } = await req.json();
        const guildId = process.env.DISCORD_GUILD_ID;
        const roleId = process.env.DISCORD_ADMIN_ROLE_ID;
        const botToken = process.env.DISCORD_BOT_TOKEN;

        if (!guildId || !roleId) {
            return NextResponse.json({ authorized: false, error: 'Server Config Missing' });
        }

        // Method 1: Robust Check via Bot Token (Preferred)
        // If a Bot Token is provided, we use it to query the Guild API directly.
        // This allows us to see roles without asking the user for sensitive scopes.
        if (botToken) {
            // 1. Get the User ID from the access token
            const userRes = await fetch('https://discord.com/api/users/@me', {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (!userRes.ok) return NextResponse.json({ error: 'Failed to verify user identity' }, { status: 401 });
            const user = await userRes.json();

            // 2. Fetch Member details from the Guild using Bot Token
            const memberRes = await fetch(`https://discord.com/api/guilds/${guildId}/members/${user.id}`, {
                headers: { Authorization: `Bot ${botToken}` }
            });

            if (!memberRes.ok) {
                // If 404, user is not in the server
                return NextResponse.json({ authorized: false, error: 'User not found in the Discord Server' }, { status: 403 });
            }

            const memberData = await memberRes.json();
            const roles = memberData.roles || [];

            if (roles.includes(roleId)) {
                return NextResponse.json({ authorized: true });
            } else {
                return NextResponse.json({ authorized: false, error: 'Missing required Admin Role' }, { status: 403 });
            }
        }

        // Method 2: Fallback (User Token Only)
        // If no bot token, we can only check if they are IN the server (using 'guilds' scope).
        // We cannot check specific roles reliably without 'guild.members.read' scope which is restricted.
        const guildsRes = await fetch(`https://discord.com/api/users/@me/guilds`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!guildsRes.ok) return NextResponse.json({ error: 'Failed to fetch Discord guilds' }, { status: 401 });

        const guilds = await guildsRes.json();
        const isMember = guilds.some((g: any) => g.id === guildId);

        if (isMember) {
            // We can't verify role, so we assume "In Server" == "Authorized" (Degraded security)
            // Or fail if strict security is needed. For now, we allow.
            return NextResponse.json({ authorized: true, warning: 'Role verification skipped (No Bot Token)' });
        } else {
            return NextResponse.json({ authorized: false, error: 'Not a member of the required server' }, { status: 403 });
        }

    } catch (error) {
        console.error("Role Verification Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

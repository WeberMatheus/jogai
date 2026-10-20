<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Data access uses the browser Supabase client with RLS (no server functions yet); permissions live in RLS policies, so keep them authoritative.
- Account type lives in `user_roles` (set by signup trigger), never on profiles — prevents privilege escalation.
- Space photos: storage bucket is private (workspace blocks public buckets); `fotos[]` holds storage paths or `/images/*` static paths, resolved via `resolvePhotos`.
- Booking requests: users may only insert `pendente`; only `status` column is updatable, by the space owner.

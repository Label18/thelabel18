import ReelsClient from './ReelsClient'
import { listReels } from './actions'

export default async function VideosReelsPage() {
  const reels = await listReels()

  return (
    <div
      className="min-h-screen bg-[#FAF7F1] px-10 py-10 font-outfit text-black"
      style={{ colorScheme: 'light' }}
    >
      <ReelsClient initialReels={reels} />
    </div>
  )
}
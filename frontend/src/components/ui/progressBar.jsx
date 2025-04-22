export const ProgressBar = ({ progress }) => (
    <div className="w-full h-3 bg-white/10 rounded-full mt-2">
      <div
        className={`h-full rounded-full transition-all duration-500 ${
          progress >= 100 ? 'bg-green-500' : 'bg-gradient-to-r from-pink-500 to-purple-500'
        }`}
        style={{ width: `${progress}%` }}
      />
    </div>
  )
  
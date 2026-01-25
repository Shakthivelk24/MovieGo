export const BlurCircle = ({ top = "auto", left = "auto", right = "auto", bottom = "auto" }) => {
  return (
    <div
      className="absolute -z-50 h-56 w-56 aspect-square rounded-full bg-primary/30 blur-3xl"
      style={{ top: top, left: left, right: right, bottom: bottom }}
    />
  )
}

export default BlurCircle 

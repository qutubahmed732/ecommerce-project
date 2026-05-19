"use client"
import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { submitReviewAction } from "@/lib/actions/reviewAction"
import { useAuthStore } from "@/store/useAuthStore"
import { toast } from "sonner"

export default function ReviewForm({ productId }: { productId: string }) {
  const { user } = useAuthStore()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!user) return toast.error("Please login to write a review")
    if (rating === 0) return toast.error("Please select a star rating")
    if (comment.length < 5) return toast.error("Comment is too short")

    setLoading(true)
    const res = await submitReviewAction({
      productId,
      userId: user.uid,
      userName: user.displayName || "Anonymous",
      rating,
      comment,
    })

    if (res.success) {
      toast.success("Review submitted!")
      setRating(0)
      setComment("")
    } else {
      toast.error("Error: " + res.error)
    }
    setLoading(false)
  }

  return (
    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mt-10">
      <h3 className="text-xl font-bold mb-4">Write a Customer Review</h3>
      
      {/* Star Selector */}
      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="focus:outline-none transition-transform active:scale-90"
          >
            <Star
              size={28}
              className={`${
                (hover || rating) >= star ? "fill-yellow-400 text-yellow-400" : "text-slate-300"
              } transition-colors`}
            />
          </button>
        ))}
        <span className="ml-2 text-slate-500 text-sm font-medium">
          {rating > 0 ? `${rating} Stars` : "Select Rating"}
        </span>
      </div>

      <Textarea
        placeholder="Share your experience with this product..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="mb-4 bg-white"
      />

      <Button 
        disabled={loading} 
        onClick={handleSubmit}
        className="bg-slate-900 text-white px-8"
      >
        {loading ? "Submitting..." : "Post Review"}
      </Button>
    </div>
  )
}
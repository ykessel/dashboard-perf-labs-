import { type NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour (range data changes less frequently)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    if (!from || !to) {
      return NextResponse.json({ error: "Missing required parameters: from, to" }, { status: 400 })
    }

    const apiUrl = `https://api-challenge.dofleini.com/air-quality/range?from=${from}&to=${to}`

    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`)
    }

    const data = await response.json()

    // Return response with optimized headers
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
        'Content-Type': 'application/json',
      }
    })
  } catch (error) {
    console.error("Range API Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch range data" },
      { status: 500 },
    )
  }
}

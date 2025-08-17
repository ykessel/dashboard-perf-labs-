import { type NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'
export const revalidate = 300 // Revalidate every 5 minutes

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const operator = searchParams.get("operator")

    if (!from || !to || !operator) {
      return NextResponse.json({ error: "Missing required parameters: from, to, operator" }, { status: 400 })
    }

    const apiUrl = `https://api-challenge.dofleini.com/air-quality/summary?from=${from}&to=${to}&operator=${operator}`

    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`)
    }

    const data = await response.json()

    // Return response with optimized headers
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        'Content-Type': 'application/json',
      }
    })
  } catch (error) {
    console.error("Summary API Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch summary data" },
      { status: 500 },
    )
  }
}

import { type NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'
export const revalidate = 600 // Revalidate every 10 minutes (timeline data changes more frequently)

export async function GET(request: NextRequest, { params }: { params: Promise<{ parameter: string }> }) {
  try {
    const searchParams = request.nextUrl.searchParams
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const interval = searchParams.get("interval")
    const { parameter } = await params

    if (!from || !to || !parameter) {
      return NextResponse.json({ error: "Missing required parameters: parameter, from, to" }, { status: 400 })
    }

    // Build API URL with optional interval parameter
    let apiUrl = `https://api-challenge.dofleini.com/air-quality/timeline/${parameter}?from=${from}&to=${to}`
    if (interval) {
      apiUrl += `&interval=${interval}`
    }

    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      next: { revalidate: 600 } // Cache for 10 minutes
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`)
    }

    const data = await response.json()

    // Return response with optimized headers
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=600, stale-while-revalidate=1200',
        'Content-Type': 'application/json',
      }
    })
  } catch (error) {
    console.error("Timeline API Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch timeline data" },
      { status: 500 },
    )
  }
}

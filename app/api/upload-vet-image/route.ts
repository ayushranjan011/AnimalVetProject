import { promises as fs } from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: 'Image too large (max 5MB)' }, { status: 400 })
    }

    const uploadDirectory = path.join(process.cwd(), 'public', 'images', 'vets')
    await fs.mkdir(uploadDirectory, { recursive: true })

    const extension = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const safeExtension = extension.replace(/[^a-z0-9]/g, '') || 'jpg'
    const fileName = `vet-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExtension}`
    const filePath = path.join(uploadDirectory, fileName)

    const arrayBuffer = await file.arrayBuffer()
    await fs.writeFile(filePath, Buffer.from(arrayBuffer))

    return NextResponse.json({
      path: `/images/vets/${fileName}`,
    })
  } catch (error) {
    console.error('Vet image upload failed:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

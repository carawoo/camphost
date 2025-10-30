'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

interface QRCodeGeneratorProps {
  campgroundId: string
  campgroundName: string
  size?: number
}

export default function QRCodeGenerator({
  campgroundId,
  campgroundName,
  size = 300
}: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [qrUrl, setQrUrl] = useState('')

  useEffect(() => {
    if (!canvasRef.current) return

    // 캠핑장별 고유 URL 생성 (프로토콜과 도메인은 환경에 따라 설정)
    const baseUrl = typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL || 'https://camphost.example.com'

    const kioskUrl = `${baseUrl}/kiosk?id=${encodeURIComponent(campgroundId)}&campground=${encodeURIComponent(campgroundName)}`
    setQrUrl(kioskUrl)

    // QR 코드 생성
    QRCode.toCanvas(canvasRef.current, kioskUrl, {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
  }, [campgroundId, size])

  const handleDownload = () => {
    if (!canvasRef.current) return

    // Canvas를 이미지로 변환하여 다운로드
    canvasRef.current.toBlob((blob) => {
      if (!blob) return

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${campgroundName}-qrcode.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    })
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow || !canvasRef.current) return

    const canvas = canvasRef.current
    const imageUrl = canvas.toDataURL('image/png')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${campgroundName} - 체크인 QR 코드</title>
          <style>
            @media print {
              body { margin: 0; }
              .print-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                padding: 40px;
              }
              h1 {
                font-size: 32px;
                margin-bottom: 20px;
                font-family: 'Pretendard Variable', -apple-system, sans-serif;
              }
              p {
                font-size: 18px;
                margin: 10px 0;
                font-family: 'Pretendard Variable', -apple-system, sans-serif;
              }
              img {
                margin: 30px 0;
                max-width: 400px;
              }
            }
            body {
              font-family: 'Pretendard Variable', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <h1>${campgroundName}</h1>
            <p>스마트폰으로 QR 코드를 스캔하여</p>
            <p>간편하게 체크인·체크아웃 하세요</p>
            <img src="${imageUrl}" alt="QR 코드" />
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              체크인 시 예약자명과 휴대폰 번호가 필요합니다
            </p>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()

    // 이미지 로드 완료 후 프린트
    printWindow.onload = () => {
      printWindow.print()
    }
  }

  return (
    <div style={{
      padding: '24px',
      backgroundColor: '#fff',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h3 style={{
          marginBottom: '16px',
          fontSize: '20px',
          fontWeight: '600',
          color: '#111827'
        }}>
          {campgroundName} QR 코드
        </h3>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '16px',
          padding: '20px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px'
        }}>
          <canvas ref={canvasRef} />
        </div>

        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          marginBottom: '16px',
          lineHeight: '1.6'
        }}>
          캠퍼들이 스마트폰으로 QR 코드를 스캔하면<br />
          자동으로 체크인 페이지로 이동합니다
        </p>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleDownload}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            이미지 다운로드
          </button>

          <button
            onClick={handlePrint}
            style={{
              padding: '10px 20px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#047857'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#059669'}
          >
            프린트하기
          </button>
        </div>

        <div style={{
          marginTop: '20px',
          padding: '12px',
          backgroundColor: '#eff6ff',
          borderRadius: '6px',
          fontSize: '13px',
          color: '#1e40af',
          lineHeight: '1.5'
        }}>
          <strong>💡 사용 방법:</strong><br />
          1. QR 코드를 다운로드하거나 프린트하세요<br />
          2. 캠핑장 입구나 안내소에 부착하세요<br />
          3. 캠퍼들이 스캔하면 자동으로 체크인 가능합니다
        </div>

        {qrUrl && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#f3f4f6',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#4b5563',
            wordBreak: 'break-all'
          }}>
            <strong>URL:</strong> {qrUrl}
          </div>
        )}
      </div>
    </div>
  )
}

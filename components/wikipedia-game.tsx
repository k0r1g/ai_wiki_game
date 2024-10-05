'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Timer } from './Timer'

// WikiContent component to render Wikipedia content with clickable blue links
const WikiContent = ({ html, onLinkClick }) => {
  const createMarkup = () => ({ __html: html })

  const handleClick = (e) => {
    if (e.target.tagName === 'A' && e.target.getAttribute('href')?.startsWith('/wiki/')) {
      e.preventDefault()
      const title = e.target.getAttribute('href').split('/wiki/')[1]
      onLinkClick(title)
    }
  }

  return (
    <div
      onClick={handleClick}
      dangerouslySetInnerHTML={createMarkup()}
      className="wiki-content"
    />
  )
}

export function WikipediaGameComponent() {
  const [leftContent, setLeftContent] = useState('')
  const [rightContent, setRightContent] = useState('')
  const [leftTitle, setLeftTitle] = useState('Jesus')
  const [rightTitle, setRightTitle] = useState('Jesus')
  const [isGameOver, setIsGameOver] = useState(false)
  const [winner, setWinner] = useState<string | null>(null)

  const fetchWikipediaContent = async (title, setContent) => {
    const url = `https://en.wikipedia.org/w/api.php?action=parse&format=json&page=${title}&prop=text&origin=*`
    try {
      const response = await fetch(url)
      const data = await response.json()
      setContent(data.parse.text['*'])
    } catch (error) {
      console.error('Error fetching Wikipedia content:', error)
    }
  }

  useEffect(() => {
    fetchWikipediaContent(leftTitle, setLeftContent)
    fetchWikipediaContent(rightTitle, setRightContent)
  }, [leftTitle, rightTitle])

  const handleLeftLinkClick = (newTitle) => {
    setLeftTitle(newTitle)
    checkWinner('Player 1', newTitle)
  }

  const handleRightLinkClick = (newTitle) => {
    setRightTitle(newTitle)
    checkWinner('Player 2', newTitle)
  }

  const checkWinner = (player: string, title: string) => {
    if (title.toLowerCase() === 'philosophy') {
      setWinner(player)
      setIsGameOver(true)
    }
  }

  const handleReset = () => {
    setLeftTitle('Jesus')
    setRightTitle('Jesus')
    setIsGameOver(false)
    setWinner(null)
  }

  const handleTimeUp = () => {
    setIsGameOver(true)
    if (!winner) {
      setWinner('No one') // If no one reached "Philosophy", set winner to "No one"
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-none bg-primary p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary-foreground">Wikipedia Game</h1>
        <Timer initialTime={185} onTimeUp={handleTimeUp} />
        <Button onClick={handleReset} className="mt-2">Reset Game</Button>
      </div>
      <div className="flex-grow flex overflow-hidden">
        <div className="w-1/2 flex flex-col">
          <div className="bg-blue-500 p-4 text-white font-bold text-xl sticky top-0 z-10">
            Pixtral 12B
          </div>
          <div className="overflow-auto flex-grow">
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-4">{leftTitle}</h2>
              <WikiContent html={leftContent} onLinkClick={handleLeftLinkClick} />
            </div>
          </div>
        </div>
        <div className="w-1/2 flex flex-col">
          <div className="bg-red-500 p-4 text-white font-bold text-xl sticky top-0 z-10">
            Human
          </div>
          <div className="overflow-auto flex-grow">
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-4">{rightTitle}</h2>
              <WikiContent html={rightContent} onLinkClick={handleRightLinkClick} />
            </div>
          </div>
        </div>
      </div>
      {isGameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
            <p className="text-xl mb-4">Winner is {winner}!</p>
            <Button onClick={handleReset}>Play Again</Button>
          </div>
        </div>
      )}
      <style jsx global>{`
        .wiki-content a {
          color: blue;
          text-decoration: underline;
        }
        .wiki-content a:hover {
          text-decoration: none;
        }
      `}</style>
    </div>
  )
}
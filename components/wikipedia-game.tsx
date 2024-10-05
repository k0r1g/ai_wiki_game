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
  const [resetTrigger, setResetTrigger] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(true)
  const [leftClickHistory, setLeftClickHistory] = useState<string[]>([])
  const [rightClickHistory, setRightClickHistory] = useState<string[]>([]) // New state for right click history
  const [randomPageTitle, setRandomPageTitle] = useState('')

  const fetchRandomWikipediaPage = async () => {
    const url = 'https://en.wikipedia.org/w/api.php?action=query&list=random&format=json&rnnamespace=0&rnlimit=1&origin=*'
    try {
      const response = await fetch(url)
      const data = await response.json()
      const randomTitle = data.query.random[0].title
      setRandomPageTitle(randomTitle)
    } catch (error) {
      console.error('Error fetching random Wikipedia page:', error)
    }
  }

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
    fetchRandomWikipediaPage()
    fetchWikipediaContent(leftTitle, setLeftContent)
    fetchWikipediaContent(rightTitle, setRightContent)
  }, [])

  useEffect(() => {
    fetchWikipediaContent(leftTitle, setLeftContent)
    fetchWikipediaContent(rightTitle, setRightContent)
  }, [leftTitle, rightTitle])

  const handleLeftLinkClick = (newTitle) => {
    setLeftTitle(newTitle)
    setLeftClickHistory(prev => [...prev, newTitle])
    checkWinner('Player 1', newTitle)
  }

  const handleRightLinkClick = (newTitle) => {
    setRightTitle(newTitle)
    setRightClickHistory(prev => [...prev, newTitle]) // Update right click history
    checkWinner('Player 2', newTitle)
  }

  const checkWinner = (player: string, title: string) => {
    if (title.toLowerCase() === 'philosophy') {
      setWinner(player)
      setIsGameOver(true)
    }
  }

  const handleReset = () => {
    fetchRandomWikipediaPage()
    setLeftTitle('Jesus')
    setRightTitle('Jesus')
    setIsGameOver(false)
    setWinner(null)
    setLeftContent('')
    setRightContent('')
    setIsTimerRunning(false)
    setLeftClickHistory([]) // Reset the left click history
    setRightClickHistory([]) // Reset the right click history
    setTimeout(() => setIsTimerRunning(true), 0)
  }

  const handleTimeUp = () => {
    setIsGameOver(true)
    setIsTimerRunning(false)
    if (!winner) {
      setWinner('No one')
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-none bg-primary p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary-foreground">Wikipedia Game</h1>
        <a
          href={`https://en.wikipedia.org/wiki/${encodeURIComponent(randomPageTitle)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xl font-semibold text-primary-foreground hover:underline"
        >
          {randomPageTitle}
        </a>
        <div className="flex items-center">
          <Timer
            initialTime={180}
            onTimeUp={handleTimeUp}
            isRunning={isTimerRunning}
          />
          <Button onClick={handleReset} className="ml-4">Reset Game</Button>
        </div>
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
          <div className="bg-gray-300 p-4 text-gray-700 font-semibold text-sm sticky bottom-0 z-10 overflow-y-auto h-20 flex-shrink-0">
            <p className="mb-2 text-base">Click History:</p>
            <div className="space-y-2 overflow-y-auto max-h-36">
              {leftClickHistory.map((title, index) => (
                <input
                  key={index}
                  type="text"
                  value={title}
                  readOnly
                  className="w-full bg-gray-200 p-2 rounded text-sm"
                />
              ))}
            </div>
          </div>
        </div>
        <div className="w-1/2 flex flex-col border-l border-gray-300"> {/* Added border-l and border-gray-300 classes here */}
          <div className="bg-red-500 p-4 text-white font-bold text-xl sticky top-0 z-10">
            Human
          </div>
          <div className="overflow-auto flex-grow">
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-4">{rightTitle}</h2>
              <WikiContent html={rightContent} onLinkClick={handleRightLinkClick} />
            </div>
          </div>
          <div className="bg-gray-200 p-4 text-gray-700 font-semibold text-sm sticky bottom-0 z-10 overflow-y-auto h-20 flex-shrink-0">
            <p className="mb-2 text-base">Click History:</p>
            <div className="space-y-2 overflow-y-auto max-h-36">
              {rightClickHistory.map((title, index) => (
                <input
                  key={index}
                  type="text"
                  value={title}
                  readOnly
                  className="w-full bg-gray-100 p-2 rounded text-sm"
                />
              ))}
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
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Beaker, Search, Filter } from "lucide-react"
import type { Ingredient, Strategy } from "@/lib/strategy-lab-data"

interface StrategyLabClientProps {
  ingredients: Ingredient[]
  strategies: Strategy[]
}

export default function StrategyLabClient({
  ingredients,
  strategies,
}: StrategyLabClientProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesSearch = ingredient.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ingredient.desc.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || ingredient.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(ingredients.map(i => i.category)))

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <Beaker className="w-10 h-10 text-purple-400" />
            Strategy Lab
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Build and test trading strategies using our comprehensive library of ingredients
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-900 border-gray-700 text-white"
            />
            </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              size="sm"
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                size="sm"
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>
                </div>

                {/* Ingredients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredIngredients.map((ingredient) => (
            <Card key={ingredient.id} className="bg-gray-900/50 border-gray-800 hover:border-purple-500/50 transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg text-white">{ingredient.title}</CardTitle>
                  <Badge
                    variant="secondary"
                    className={`ml-2 ${
                      ingredient.complexity === 1 
                        ? "bg-green-500/20 text-green-400"
                        : ingredient.complexity === 2
                        ? "bg-yellow-500/20 text-yellow-400" 
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    Level {ingredient.complexity}
                          </Badge>
                      </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                              {ingredient.desc}
                            </p>
                <div className="flex flex-wrap gap-1 mb-4">
                            {ingredient.tags.slice(0, 3).map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                      className="text-xs border-gray-600 text-gray-300"
                              >
                                {tag}
                              </Badge>
                  ))}
                  {ingredient.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                      +{ingredient.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                  Add to Strategy
                </Button>
              </CardContent>
            </Card>
                          ))}
                        </div>

        {filteredIngredients.length === 0 && (
          <div className="text-center py-12">
            <Filter className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No ingredients found</h3>
            <p className="text-gray-400">Try adjusting your search terms or filters</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
  )
}

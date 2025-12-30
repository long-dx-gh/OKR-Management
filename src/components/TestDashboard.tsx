import { useState } from 'react'
import { CheckCircle2, XCircle, Clock, Play } from 'lucide-react'

interface TestItem {
  id: string
  category: string
  name: string
  status: 'pending' | 'passed' | 'failed'
  description: string
}

const TEST_CHECKLIST: TestItem[] = [
  { id: 'auth-1', category: 'Authentication', name: 'Login functionality', status: 'pending', description: 'User can log in with email/password' },
  { id: 'auth-2', category: 'Authentication', name: 'Logout functionality', status: 'pending', description: 'User can logout successfully' },
  { id: 'obj-1', category: 'Objectives', name: 'Create objective', status: 'pending', description: 'User can create new objective' },
  { id: 'obj-2', category: 'Objectives', name: 'Edit objective', status: 'pending', description: 'User can update objective details' },
  { id: 'obj-3', category: 'Objectives', name: 'Delete objective', status: 'pending', description: 'User can delete objective' },
  { id: 'kr-1', category: 'Key Results', name: 'Add key result', status: 'pending', description: 'User can add key results to objective' },
  { id: 'kr-2', category: 'Key Results', name: 'Update progress', status: 'pending', description: 'User can update key result progress' },
  { id: 'comment-1', category: 'Comments', name: 'Add comment', status: 'pending', description: 'User can comment on objectives' },
  { id: 'analytics-1', category: 'Analytics', name: 'Dashboard loads', status: 'pending', description: 'Analytics dashboard displays correctly' },
  { id: 'analytics-2', category: 'Analytics', name: 'Charts render', status: 'pending', description: 'All charts render correctly' },
]

export default function TestDashboard() {
  const [tests, setTests] = useState<TestItem[]>(TEST_CHECKLIST)

  const toggleStatus = (id: string) => {
    setTests(prev =>
      prev.map(test => {
        if (test.id === id) {
          const nextStatus = test.status === 'pending' ? 'passed' : test.status === 'passed' ? 'failed' : 'pending'
          return { ...test, status: nextStatus }
        }
        return test
      })
    )
  }

  const categories = Array.from(new Set(tests.map(t => t.category)))
  const stats = {
    total: tests.length,
    passed: tests.filter(t => t.status === 'passed').length,
    failed: tests.filter(t => t.status === 'failed').length,
    pending: tests.filter(t => t.status === 'pending').length,
  }

  const getStatusIcon = (status: string) => {
    if (status === 'passed') return <CheckCircle2 className="w-5 h-5 text-green-500" />
    if (status === 'failed') return <XCircle className="w-5 h-5 text-red-500" />
    return <Clock className="w-5 h-5 text-gray-400" />
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8 overflow-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <Play className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Test Dashboard</h1>
              <p className="text-gray-600">Manual testing checklist</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Passed</div>
            <div className="text-3xl font-bold text-green-600 mt-1">{stats.passed}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Failed</div>
            <div className="text-3xl font-bold text-red-600 mt-1">{stats.failed}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Pending</div>
            <div className="text-3xl font-bold text-gray-600 mt-1">{stats.pending}</div>
          </div>
        </div>

        {categories.map(category => {
          const categoryTests = tests.filter(t => t.category === category)
          return (
            <div key={category} className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">{category}</h2>
              </div>
              <div className="divide-y">
                {categoryTests.map(test => (
                  <button key={test.id} onClick={() => toggleStatus(test.id)} className="w-full p-4 flex items-start gap-4 hover:bg-gray-50 text-left">
                    {getStatusIcon(test.status)}
                    <div className="flex-1">
                      <div className="font-medium">{test.name}</div>
                      <div className="text-sm text-gray-600">{test.description}</div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${test.status === 'passed' ? 'bg-green-100 text-green-800' : test.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                      {test.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

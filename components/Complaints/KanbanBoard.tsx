'use client'

import React, { useState, useEffect } from 'react'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd'
import {
  AlertCircle,
  Clock,
  CheckCircle,
  MoreHorizontal,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { complaintsApi } from '@/lib/api/complaints'
import type { Complaint } from '@/lib/types'
import { useClientUserRole } from '@/lib/auth/client-roles'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import ComplaintDetailsModal from './ComplaintDetailsModal'

interface Ticket {
  id: string
  title: string
  asset: string
  priority: 'High' | 'Medium' | 'Low' | 'Critical'
  time: string
  complaint: Complaint
}

// Map database status (Prisma enum: PascalCase) to Kanban column IDs
const statusToColumn: Record<string, string> = {
  Open: 'open',
  InProgress: 'inProgress',
  Resolved: 'resolved',
  Closed: 'closed',
  Escalated: 'open',
  // Also handle old uppercase format for backward compatibility
  OPEN: 'open',
  IN_PROGRESS: 'inProgress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  ESCALATED: 'open',
}

// Map Kanban column IDs to database status (Prisma enum: PascalCase)
const columnToStatus: Record<string, string> = {
  open: 'Open',
  inProgress: 'InProgress',
  resolved: 'Resolved',
  closed: 'Closed',
}

const initialColumns: Record<string, Ticket[]> = {
  open: [],
  inProgress: [],
  resolved: [],
  closed: [],
}

// Forward ref to expose refresh method
const KanbanBoard = React.forwardRef<{ refresh?: () => void }, {}>(
  (props, ref) => {
    const { user } = useUser()
    const userRole = useClientUserRole()

    // Debug: Log user role for troubleshooting
    React.useEffect(() => {
      if (userRole) {
        console.log('User role loaded:', userRole)
      }
    }, [userRole])
    const [columns, setColumns] =
      useState<Record<string, Ticket[]>>(initialColumns)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [selectedComplaint, setSelectedComplaint] =
      useState<Complaint | null>(null)
    const [showDetailsModal, setShowDetailsModal] = useState(false)

    // Fetch complaints from database - GLOBAL VIEW (all complaints from database)
    const fetchComplaints = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch ALL complaints globally from database (no user filtering)
        const filters: any = {
          page: 1,
          limit: 1000, // Get all complaints - this is global view
        }

        // No filtering - show ALL complaints from database
        const response = await complaintsApi.getAll(filters)

        if (response && response.data) {
          // Group complaints by status
          const grouped: Record<string, Ticket[]> = {
            open: [],
            inProgress: [],
            resolved: [],
            closed: [],
          }

          response.data.forEach((complaint: Complaint) => {
            const ticket: Ticket = {
              id: complaint.id,
              title: complaint.title,
              asset:
                (complaint.asset as any)?.name ||
                complaint.assetId ||
                'Unknown Asset',
              priority: complaint.priority,
              time: formatTimeAgo(complaint.reportedAt),
              complaint,
            }

            const columnId = statusToColumn[complaint.status] || 'open'
            if (grouped[columnId]) {
              grouped[columnId].push(ticket)
            }
          })

          setColumns(grouped)
        }
      } catch (err: any) {
        console.error('Error fetching complaints:', err)
        setError(err.message || 'Failed to load complaints')
        toast.error('Failed to load complaints')
      } finally {
        setLoading(false)
      }
    }

    // Expose refresh method via ref
    React.useImperativeHandle(ref, () => ({
      refresh: fetchComplaints,
    }))

    // Fetch on mount and poll for updates every 30 seconds
    useEffect(() => {
      fetchComplaints()

      const interval = setInterval(() => {
        fetchComplaints()
      }, 30000)

      return () => clearInterval(interval)
    }, []) // Fetch on mount - no dependencies, shows ALL complaints

    const formatTimeAgo = (dateString: string): string => {
      try {
        const date = new Date(dateString)
        return formatDistanceToNow(date, { addSuffix: true })
      } catch {
        return 'Unknown'
      }
    }

    const onDragEnd = async (result: DropResult) => {
      const { source, destination } = result
      if (!destination) return

      // Only full access users can update status
      if (userRole !== 'full_access') {
        toast.error('Only full access users can update complaint status')
        return
      }

      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      )
        return

      const sourceCol = [...columns[source.droppableId]]
      const [removed] = sourceCol.splice(source.index, 1)
      const ticket = removed as Ticket

      // Optimistically update UI
      const destCol = [...columns[destination.droppableId]]
      destCol.splice(destination.index, 0, ticket)
      setColumns({
        ...columns,
        [source.droppableId]: sourceCol,
        [destination.droppableId]: destCol,
      })

      // Update status in database
      if (source.droppableId !== destination.droppableId) {
        setUpdatingId(ticket.id)
        try {
          const newStatus = columnToStatus[destination.droppableId]
          if (!newStatus) {
            throw new Error(
              `Invalid destination column: ${destination.droppableId}`
            )
          }

          console.log('Updating complaint:', ticket.id, 'to status:', newStatus)
          const result = await complaintsApi.update(ticket.id, {
            status: newStatus,
          })

          if (result.success) {
            toast.success('Complaint status updated')
            // Refresh to get latest data
            await fetchComplaints()
          } else {
            throw new Error(result.error || 'Failed to update complaint status')
          }
        } catch (err: any) {
          console.error('Error updating complaint:', err)
          const errorMessage =
            err?.message || err?.error || 'Failed to update complaint status'
          toast.error(errorMessage)
          // Revert optimistic update
          await fetchComplaints()
        } finally {
          setUpdatingId(null)
        }
      }
    }

    const getPriorityColor = (p: string) => {
      switch (p) {
        case 'Critical':
          return 'bg-red-100 text-red-800'
        case 'High':
          return 'bg-orange-100 text-orange-800'
        case 'Medium':
          return 'bg-yellow-100 text-yellow-800'
        default:
          return 'bg-blue-100 text-blue-800'
      }
    }

    if (loading && Object.values(columns).every((col) => col.length === 0)) {
      return (
        <div className='flex items-center justify-center h-full'>
          <div className='text-center'>
            <Loader2
              size={32}
              className='animate-spin mx-auto mb-4 text-primary'
            />
            <p className='text-text-secondary'>Loading complaints...</p>
          </div>
        </div>
      )
    }

    if (error && Object.values(columns).every((col) => col.length === 0)) {
      return (
        <div className='flex items-center justify-center h-full'>
          <div className='text-center'>
            <AlertTriangle size={32} className='mx-auto mb-4 text-danger' />
            <p className='text-text-primary font-medium mb-2'>
              Error Loading Complaints
            </p>
            <p className='text-text-secondary mb-4'>{error}</p>
            <button
              onClick={fetchComplaints}
              className='px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark'
            >
              Retry
            </button>
          </div>
        </div>
      )
    }

    const columnConfig = [
      { id: 'open', label: 'Open', icon: AlertCircle, color: 'text-red-500' },
      {
        id: 'inProgress',
        label: 'In Progress',
        icon: Clock,
        color: 'text-orange-500',
      },
      {
        id: 'resolved',
        label: 'Resolved',
        icon: CheckCircle,
        color: 'text-green-500',
      },
      {
        id: 'closed',
        label: 'Closed',
        icon: CheckCircle,
        color: 'text-gray-500',
      },
    ]

    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <div
          className='flex gap-3 sm:gap-6 h-full overflow-x-auto overflow-y-hidden pb-4 px-2 sm:px-0 scrollbar-hide'
          style={{
            WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
            minHeight: 0, // Important for flex scrolling
          }}
        >
          {columnConfig.map(({ id, label, icon: Icon, color }) => {
            const tickets = columns[id] || []
            return (
              <div
                key={id}
                className='flex-shrink-0 w-[280px] sm:w-auto sm:flex-1 sm:min-w-[300px] bg-gray-100 rounded-xl p-3 sm:p-4 flex flex-col h-full'
                style={{
                  minHeight: 0, // Important for flex scrolling
                }}
              >
                <div className='flex justify-between items-center mb-3 sm:mb-4 flex-shrink-0'>
                  <h3 className='font-bold capitalize text-gray-700 flex items-center gap-1 sm:gap-2 text-xs sm:text-base'>
                    <Icon
                      size={14}
                      className={`${color} sm:w-[18px] sm:h-[18px]`}
                    />
                    <span className='truncate'>
                      {label.length > 8 ? label.substring(0, 8) + '...' : label}
                    </span>
                    <span className='bg-gray-200 text-gray-600 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs ml-auto sm:ml-2 flex-shrink-0'>
                      {tickets.length}
                    </span>
                  </h3>
                  <button className='text-gray-400 hover:text-gray-600 flex-shrink-0'>
                    <MoreHorizontal size={14} className='sm:w-4 sm:h-4' />
                  </button>
                </div>

                <Droppable droppableId={id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 flex flex-col gap-2 sm:gap-3 min-h-0 overflow-y-auto scrollbar-thin ${
                        snapshot.isDraggingOver ? 'bg-gray-50 rounded-lg' : ''
                      }`}
                      style={{
                        WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
                        minHeight: 0, // Important for flex scrolling
                        touchAction:
                          userRole === 'full_access' ? 'pan-y' : 'auto', // Allow vertical scroll, enable drag for full_access
                      }}
                    >
                      {tickets.length === 0 ? (
                        <div className='flex-1 flex items-center justify-center text-center py-8'>
                          <p className='text-sm text-gray-400'>No complaints</p>
                        </div>
                      ) : (
                        tickets.map((ticket, index) => (
                          <Draggable
                            key={ticket.id}
                            draggableId={ticket.id}
                            index={index}
                            isDragDisabled={
                              updatingId === ticket.id ||
                              userRole !== 'full_access' // Disable if not full_access (null or 'normal')
                            }
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  touchAction:
                                    userRole === 'full_access'
                                      ? 'none'
                                      : 'auto', // Enable touch dragging only for full_access
                                }}
                                className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${
                                  userRole === 'full_access'
                                    ? 'cursor-grab active:cursor-grabbing'
                                    : 'cursor-pointer'
                                } ${
                                  snapshot.isDragging
                                    ? 'shadow-lg ring-2 ring-primary rotate-2'
                                    : ''
                                } ${
                                  updatingId === ticket.id ? 'opacity-50' : ''
                                }`}
                                onClick={(e) => {
                                  // Only open modal if not dragging
                                  if (!snapshot.isDragging) {
                                    setSelectedComplaint(ticket.complaint)
                                    setShowDetailsModal(true)
                                  }
                                }}
                              >
                                <div className='flex justify-between items-start mb-2'>
                                  <span className='text-xs font-bold text-gray-400'>
                                    {ticket.id}
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getPriorityColor(
                                      ticket.priority
                                    )}`}
                                  >
                                    {ticket.priority}
                                  </span>
                                </div>
                                <h4 className='font-bold text-sm mb-1'>
                                  {ticket.title}
                                </h4>
                                <p className='text-xs text-gray-500 mb-3'>
                                  {ticket.asset}
                                </p>
                                <div className='flex items-center gap-1 text-xs text-gray-400'>
                                  <Clock size={12} />
                                  {ticket.time}
                                </div>
                                {updatingId === ticket.id && (
                                  <div className='mt-2 flex items-center gap-2 text-xs text-primary'>
                                    <Loader2
                                      size={12}
                                      className='animate-spin'
                                    />
                                    Updating...
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>

        {/* Complaint Details Modal */}
        <ComplaintDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedComplaint(null)
          }}
          complaint={selectedComplaint}
          onUpdate={fetchComplaints}
        />
      </DragDropContext>
    )
  }
)

KanbanBoard.displayName = 'KanbanBoard'

export default KanbanBoard

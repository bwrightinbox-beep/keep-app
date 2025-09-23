import { getSupabaseClient } from './supabase'
import { handleError, createAppError, errorCodes, type AppError } from './error-handling'

export interface Memory {
  id: string
  title: string
  description: string
  date: string
  category: string
  rating: number
  created_at?: string
  updated_at?: string
}

export interface PartnerProfile {
  id?: string
  name: string
  favoriteColor: string
  favoriteFood: string
  favoriteHobbies: string[]
  importantDates: Array<{ date: string; description: string }>
  notes: string
  // Database fields
  birthday?: string
  anniversary?: string
  loveLanguages?: string[]
  favoriteThings?: string
  dislikes?: string
  sizes?: {
    shirt?: string
    pants?: string
    shoe?: string
    ring?: string
  }
  created_at?: string
  updated_at?: string
}

export interface Plan {
  id: string
  title: string
  description: string
  date: string
  category: string
  priority: 'low' | 'medium' | 'high'
  completed: boolean
  created_at?: string
  updated_at?: string
}

export interface AppSettings {
  id?: string
  notifications: boolean
  privacy: 'public' | 'private'
  userName?: string
  locale?: string
  currency?: string
  created_at?: string
  updated_at?: string
}

class DataService {
  private supabase = getSupabaseClient()
  private partnerProfileCache = new Map<string, { data: PartnerProfile | null; timestamp: number; promise?: Promise<PartnerProfile | null> }>()
  private appSettingsCache = new Map<string, { data: AppSettings | null; timestamp: number; promise?: Promise<AppSettings | null> }>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  private isAuthenticated(userId: string | null | undefined): boolean {
    return Boolean(userId)
  }

  private getStorageKey(type: string): string {
    const key = `little-things-${type}`
    console.log('[DataService] Storage key for', type, ':', key)
    return key
  }

  private async ensureUserExists(userId: string, userEmail?: string): Promise<boolean> {
    try {
      // Check if user exists
      const { data: existingUser, error: fetchError } = await this.supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single()

      if (existingUser) {
        console.log('[DataService] User already exists')
        return true
      }

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('[DataService] Error checking user existence:', fetchError)
        return false
      }

      // User doesn't exist, create them
      console.log('[DataService] Creating user record:', userId)
      const { error: insertError } = await this.supabase
        .from('users')
        .insert([{
          id: userId,
          email: userEmail || 'unknown@example.com'
        }] as any)

      if (insertError) {
        console.error('[DataService] Error creating user:', insertError)
        return false
      }

      console.log('[DataService] User created successfully')
      return true
    } catch (error) {
      console.error('[DataService] Exception ensuring user exists:', error)
      return false
    }
  }

  async getMemories(userId: string | null = null): Promise<Memory[]> {
    if (!this.isAuthenticated(userId)) {
      // Fallback to localStorage for unauthenticated users
      try {
        const stored = localStorage.getItem(this.getStorageKey('memories'))
        return stored ? JSON.parse(stored) : []
      } catch (error) {
        console.error('Error loading memories from localStorage:', error)
        return []
      }
    }
    const { data, error } = await this.supabase
      .from('memories')
      .select('*')
      .eq('user_id', userId!)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching memories:', error)
      return []
    }

    // Map database fields to app expected format
    const mappedMemories = (data as any[] || []).map((item: any) => ({
      id: item.id.toString(),
      title: item.title,
      description: item.body || '', // Get description from body field
      category: item.tags && item.tags.length > 0 ? item.tags[0] : 'general',
      rating: item.importance === 'high' ? 5 : item.importance === 'medium' ? 3 : 1,
      date: item.created_at,
      created_at: item.created_at,
      updated_at: item.updated_at
    }))

    return mappedMemories
  }

  async saveMemory(userId: string | null, memory: Omit<Memory, 'id' | 'created_at' | 'updated_at'>): Promise<Memory> {
    console.log('[DataService] saveMemory called with:', { userId, memory })
    console.log('[DataService] isAuthenticated:', this.isAuthenticated(userId))
    
    // Validate input
    if (!memory.title?.trim()) {
      throw createAppError(
        errorCodes.VALIDATION_ERROR,
        'Memory title is required',
        'Please enter a title for your memory.',
        false
      );
    }
    
    if (!this.isAuthenticated(userId)) {
      // Fallback to localStorage for unauthenticated users
      console.log('[DataService] Using localStorage fallback')
      try {
        const memories = await this.getMemories(null)
        console.log('[DataService] Current memories from localStorage:', memories.length)
        const newMemory: Memory = {
          ...memory,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        const updatedMemories = [...memories, newMemory]
        localStorage.setItem(this.getStorageKey('memories'), JSON.stringify(updatedMemories))
        console.log('[DataService] Saved to localStorage successfully:', newMemory)
        return newMemory
      } catch (error) {
        const appError = handleError(error, 'DataService.saveMemory.localStorage');
        throw createAppError(
          errorCodes.DATABASE_ERROR,
          'Failed to save memory to local storage',
          'Unable to save your memory. Please try again.',
          true
        );
      }
    }

    console.log('[DataService] Using Supabase for authenticated user')
    try {
      // Ensure user exists before saving memory
      const userExists = await this.ensureUserExists(userId!, 'itsdjbeazy@gmail.com')
      if (!userExists) {
        throw createAppError(
          errorCodes.PERMISSION_ERROR,
          'User account setup failed',
          'Unable to set up your account. Please try signing in again.',
          true
        );
      }

      // Map app fields to database schema (only use existing columns)
      const insertData = {
        title: memory.title,
        body: memory.description || '', // Store description in body field
        // Map category to first tag in tags array for now
        tags: memory.category ? [memory.category] : [],
        // Store rating in importance field (mapping 1-5 to low/medium/high)
        importance: memory.rating && memory.rating >= 4 ? 'high' : 
                   memory.rating && memory.rating >= 3 ? 'medium' : 'low',
        user_id: userId
      }
      console.log('[DataService] Inserting into Supabase (mapped fields):', insertData)
      
      const { data, error } = await this.supabase
        .from('memories')
        .insert([insertData] as any)
        .select()
        .single()

      if (error) {
        console.error('[DataService] Supabase error saving memory:', error)
        console.error('[DataService] Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        throw createAppError(
          errorCodes.DATABASE_ERROR,
          `Database error: ${error.message}`,
          'Unable to save your memory. Please try again.',
          true
        );
      }

      console.log('[DataService] Successfully saved to Supabase:', data)
      // Map database fields back to app expected format
      const mappedMemory: Memory = {
        id: (data as any).id.toString(),
        title: (data as any).title,
        description: (data as any).body || '', // Get description from body field
        category: (data as any).tags && (data as any).tags.length > 0 ? (data as any).tags[0] : 'general',
        rating: (data as any).importance === 'high' ? 5 : (data as any).importance === 'medium' ? 3 : 1,
        date: (data as any).created_at,
        created_at: (data as any).created_at,
        updated_at: (data as any).updated_at
      }
      return mappedMemory
    } catch (error) {
      if (error instanceof Error && error.name === 'AppError') {
        throw error; // Re-throw AppErrors
      }
      
      const appError = handleError(error, 'DataService.saveMemory.supabase');
      throw createAppError(
        errorCodes.DATABASE_ERROR,
        'Failed to save memory to database',
        'Unable to save your memory. Please try again.',
        true
      );
    }
  }

  async updateMemory(userId: string | null, id: string, memory: Partial<Memory>): Promise<Memory | null> {
    if (!this.isAuthenticated(userId)) {
      // Fallback to localStorage for unauthenticated users
      try {
        const memories = await this.getMemories(null)
        const memoryIndex = memories.findIndex(m => m.id === id)
        if (memoryIndex === -1) return null
        
        const updatedMemory = {
          ...memories[memoryIndex],
          ...memory,
          updated_at: new Date().toISOString()
        }
        memories[memoryIndex] = updatedMemory
        localStorage.setItem(this.getStorageKey('memories'), JSON.stringify(memories))
        return updatedMemory
      } catch (error) {
        console.error('Error updating memory in localStorage:', error)
        return null
      }
    }

    const { data, error } = await (this.supabase as any)
      .from('memories')
      .update({
        ...memory,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId!)
      .select()
      .single()

    if (error) {
      console.error('Error updating memory:', error)
      return null
    }

    return data
  }

  async deleteMemory(userId: string | null, id: string): Promise<boolean> {
    if (!this.isAuthenticated(userId)) {
      // Fallback to localStorage for unauthenticated users
      try {
        const memories = await this.getMemories(null)
        const filteredMemories = memories.filter(m => m.id !== id)
        localStorage.setItem(this.getStorageKey('memories'), JSON.stringify(filteredMemories))
        return true
      } catch (error) {
        console.error('Error deleting memory from localStorage:', error)
        return false
      }
    }

    const { error } = await this.supabase
      .from('memories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId!)

    if (error) {
      console.error('Error deleting memory:', error)
      return false
    }

    return true
  }

  async getPartnerProfile(userId: string | null): Promise<PartnerProfile | null> {
    const cacheKey = userId || 'anonymous'
    const now = Date.now()
    
    // Check cache first
    const cached = this.partnerProfileCache.get(cacheKey)
    if (cached) {
      // If there's a pending promise, return it to prevent duplicate requests
      if (cached.promise) {
        return cached.promise
      }
      
      // If cache is still valid, return cached data
      if (now - cached.timestamp < this.CACHE_TTL) {
        return cached.data
      }
    }

    if (!this.isAuthenticated(userId)) {
      // Fallback to localStorage for unauthenticated users
      try {
        console.log('[DataService] Loading from localStorage for unauthenticated user')
        const stored = localStorage.getItem(this.getStorageKey('partner-profile'))
        console.log('[DataService] Raw localStorage data:', stored)
        const result = stored ? JSON.parse(stored) : null
        console.log('[DataService] Parsed localStorage result:', result)
        this.partnerProfileCache.set(cacheKey, { data: result, timestamp: now })
        return result
      } catch (error) {
        console.error('Error loading partner profile from localStorage:', error)
        const result = null
        this.partnerProfileCache.set(cacheKey, { data: result, timestamp: now })
        return result
      }
    }

    // Clear cache to force fresh data load
    this.partnerProfileCache.delete(cacheKey)
    
    // Create a promise for the database request that merges with localStorage
    const fetchPromise = this.fetchPartnerProfileFromDB(userId!).then(dbResult => {
      // Also check localStorage for any existing data to merge
      let localStorageData: PartnerProfile | null = null
      try {
        const stored = localStorage.getItem(this.getStorageKey('partner-profile'))
        localStorageData = stored ? JSON.parse(stored) : null
      } catch (error) {
        console.warn('[DataService] Could not parse localStorage data:', error)
      }

      // If we have localStorage data and it's more complete than DB data, merge them
      let result = dbResult
      if (localStorageData && this.isLocalStorageDataMoreComplete(localStorageData, dbResult)) {
        console.log('[DataService] Merging localStorage data with database data')
        result = this.mergePartnerProfiles(localStorageData, dbResult)
        
        // Save the merged data back to database if it's more complete
        if (result && result !== dbResult) {
          this.savePartnerProfile(userId, result).catch(error => {
            console.warn('[DataService] Could not save merged profile to database:', error)
          })
        }
      }

      // Cache the result and clear the promise
      this.partnerProfileCache.set(cacheKey, { data: result, timestamp: now })
      return result
    }).catch(error => {
      // Clear the failed promise from cache
      this.partnerProfileCache.delete(cacheKey)
      throw error
    })

    // Store the promise in cache to prevent duplicate requests
    this.partnerProfileCache.set(cacheKey, { data: null, timestamp: now, promise: fetchPromise })
    
    return fetchPromise
  }

  private async fetchPartnerProfileFromDB(userId: string): Promise<PartnerProfile | null> {
    try {
      console.log('[DataService] Fetching partner profile from DB for user:', userId)
      const { data, error } = await this.supabase
        .from('partner_profiles')
        .select('*')
        .eq('user_id', userId!)
        .single()
        
      console.log('[DataService] Raw database response:', { data, error })

      if (error) {
        // Handle common error cases silently
        if (error.code === 'PGRST116' || error.code === 'PGRST301' || (error as any).status === 406) {
          // Table doesn't exist, no rows found, or not acceptable - return null silently
          return null
        }
        console.error('Error fetching partner profile:', error)
        return null
      }

      if (!data) {
        return null
      }

      // Map database fields to app expected format - handle any field names
      const dataAny = data as any
      const mappedProfile: PartnerProfile = {
        id: dataAny.id?.toString(),
        name: dataAny.name || '',
        favoriteColor: dataAny.favorite_color || dataAny.favouriteColor || 'Unknown',
        favoriteFood: dataAny.favorite_food || dataAny.favouriteFood || 'Unknown',
        favoriteHobbies: dataAny.favorite_hobbies || dataAny.favourite_hobbies || dataAny.love_languages || [],
        importantDates: [
          ...(dataAny.birthday ? [{ date: dataAny.birthday, description: 'Birthday' }] : []),
          ...(dataAny.anniversary ? [{ date: dataAny.anniversary, description: 'Anniversary' }] : [])
        ],
        notes: dataAny.notes || dataAny.favorite_things || dataAny.favourite_things || '',
        sizes: dataAny.sizes || {},
        birthday: dataAny.birthday,
        anniversary: dataAny.anniversary,
        loveLanguages: dataAny.love_languages || [],
        favoriteThings: dataAny.favorite_things || dataAny.favourite_things || '',
        dislikes: dataAny.dislikes,
        created_at: dataAny.created_at,
        updated_at: dataAny.updated_at
      }

      return mappedProfile
    } catch (networkError) {
      // Network or other errors - fail silently and use localStorage fallback
      console.warn('[DataService] Network error fetching partner profile, using localStorage fallback:', networkError)
      try {
        const stored = localStorage.getItem(this.getStorageKey('partner-profile'))
        const result = stored ? JSON.parse(stored) : null
        console.log('[DataService] localStorage fallback result:', result)
        return result
      } catch (error) {
        console.error('[DataService] localStorage fallback failed:', error)
        return null
      }
    }
  }

  private clearPartnerProfileCache(userId: string | null) {
    const cacheKey = userId || 'anonymous'
    this.partnerProfileCache.delete(cacheKey)
  }

  private clearAppSettingsCache(userId: string | null) {
    const cacheKey = userId || 'anonymous'
    this.appSettingsCache.delete(cacheKey)
  }

  async savePartnerProfile(userId: string | null, profile: PartnerProfile): Promise<PartnerProfile | null> {
    console.log('[DataService] savePartnerProfile called with userId:', userId)
    console.log('[DataService] savePartnerProfile profile:', profile)
    console.log('[DataService] isAuthenticated:', this.isAuthenticated(userId))
    
    // Clear cache when saving
    this.clearPartnerProfileCache(userId)
    
    if (!this.isAuthenticated(userId)) {
      // Fallback to localStorage for unauthenticated users
      try {
        console.log('[DataService] Using localStorage for unauthenticated user')
        const profileWithTimestamps: PartnerProfile = {
          ...profile,
          id: profile.id || Date.now().toString(),
          created_at: profile.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        console.log('[DataService] Saving to localStorage:', profileWithTimestamps)
        localStorage.setItem(this.getStorageKey('partner-profile'), JSON.stringify(profileWithTimestamps))
        console.log('[DataService] Successfully saved to localStorage')
        return profileWithTimestamps
      } catch (error) {
        console.error('Error saving partner profile to localStorage:', error)
        return null
      }
    }

    // Ensure user exists before saving profile
    const userExists = await this.ensureUserExists(userId!, 'itsdjbeazy@gmail.com')
    if (!userExists) {
      console.error('[DataService] Failed to ensure user exists for partner profile')
      return null
    }

    const existingProfile = await this.getPartnerProfile(userId)

    // Map app fields to database fields - use conservative field names
    const mappedData: any = {
      name: profile.name,
      user_id: userId
    }
    
    // Only add fields if they have values to avoid column errors
    if (profile.birthday) mappedData.birthday = profile.birthday
    if (profile.anniversary) mappedData.anniversary = profile.anniversary
    if (profile.favoriteColor) mappedData.favorite_color = profile.favoriteColor
    if (profile.favoriteFood) mappedData.favorite_food = profile.favoriteFood
    if (profile.favoriteHobbies?.length) mappedData.favorite_hobbies = profile.favoriteHobbies
    if (profile.loveLanguages?.length) mappedData.love_languages = profile.loveLanguages
    if (profile.notes) mappedData.notes = profile.notes
    if (profile.favoriteThings) mappedData.favorite_things = profile.favoriteThings
    if (profile.dislikes) mappedData.dislikes = profile.dislikes
    if (profile.sizes && Object.keys(profile.sizes).length) mappedData.sizes = profile.sizes
    
    console.log('[DataService] Mapped data for database:', mappedData)

    if (existingProfile) {
      // Remove user_id from update data since it shouldn't change
      const updateData = { ...mappedData }
      delete updateData.user_id
      updateData.updated_at = new Date().toISOString()
      
      console.log('[DataService] Updating existing profile with:', updateData)
      const { data, error } = await (this.supabase as any)
        .from('partner_profiles')
        .update(updateData)
        .eq('user_id', userId!)
        .select()
        .single()

      if (error) {
        console.error('[DataService] Error updating partner profile:', error)
        console.error('[DataService] Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        
        // Fallback to localStorage if database fails
        console.log('[DataService] Database update failed, falling back to localStorage')
        try {
          const profileWithTimestamps: PartnerProfile = {
            ...profile,
            id: profile.id || Date.now().toString(),
            created_at: profile.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          localStorage.setItem(this.getStorageKey('partner-profile'), JSON.stringify(profileWithTimestamps))
          console.log('[DataService] Successfully saved to localStorage as fallback')
          return profileWithTimestamps
        } catch (localError) {
          console.error('[DataService] localStorage fallback also failed:', localError)
          return null
        }
      }
      
      console.log('[DataService] Successfully updated profile, result:', data)

      // Map back to app format (update case)
      const dataAny = data as any
      const mappedProfile: PartnerProfile = {
        id: dataAny.id?.toString(),
        name: dataAny.name || '',
        favoriteColor: 'Unknown', // Not in DB schema
        favoriteFood: 'Unknown', // Not in DB schema
        favoriteHobbies: dataAny.love_languages || [],
        importantDates: [
          ...(dataAny.birthday ? [{ date: dataAny.birthday, description: 'Birthday' }] : []),
          ...(dataAny.anniversary ? [{ date: dataAny.anniversary, description: 'Anniversary' }] : [])
        ],
        notes: dataAny.favorite_things || '',
        sizes: dataAny.sizes || {},
        birthday: dataAny.birthday,
        anniversary: dataAny.anniversary,
        loveLanguages: dataAny.love_languages || [],
        favoriteThings: dataAny.favorite_things,
        dislikes: dataAny.dislikes,
        created_at: dataAny.created_at,
        updated_at: dataAny.updated_at
      }

      return mappedProfile
    } else {
      console.log('[DataService] Creating new profile with:', mappedData)
      const { data, error } = await (this.supabase as any)
        .from('partner_profiles')
        .insert([mappedData])
        .select()
        .single()

      if (error) {
        console.error('[DataService] Error creating partner profile:', error)
        console.error('[DataService] Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        
        // Fallback to localStorage if database fails
        console.log('[DataService] Database create failed, falling back to localStorage')
        try {
          const profileWithTimestamps: PartnerProfile = {
            ...profile,
            id: profile.id || Date.now().toString(),
            created_at: profile.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          localStorage.setItem(this.getStorageKey('partner-profile'), JSON.stringify(profileWithTimestamps))
          console.log('[DataService] Successfully saved to localStorage as fallback')
          return profileWithTimestamps
        } catch (localError) {
          console.error('[DataService] localStorage fallback also failed:', localError)
          return null
        }
      }
      
      console.log('[DataService] Successfully created profile, result:', data)

      // Map back to app format (insert case)
      const dataAny = data as any
      const mappedProfile: PartnerProfile = {
        id: dataAny.id?.toString(),
        name: dataAny.name || '',
        favoriteColor: 'Unknown', // Not in DB schema
        favoriteFood: 'Unknown', // Not in DB schema
        favoriteHobbies: dataAny.love_languages || [],
        importantDates: [
          ...(dataAny.birthday ? [{ date: dataAny.birthday, description: 'Birthday' }] : []),
          ...(dataAny.anniversary ? [{ date: dataAny.anniversary, description: 'Anniversary' }] : [])
        ],
        notes: dataAny.favorite_things || '',
        sizes: dataAny.sizes || {},
        birthday: dataAny.birthday,
        anniversary: dataAny.anniversary,
        loveLanguages: dataAny.love_languages || [],
        favoriteThings: dataAny.favorite_things,
        dislikes: dataAny.dislikes,
        created_at: dataAny.created_at,
        updated_at: dataAny.updated_at
      }

      return mappedProfile
    }
  }

  async getPlans(userId: string | null = null): Promise<Plan[]> {
    if (!this.isAuthenticated(userId)) {
      // Fallback to localStorage for unauthenticated users
      try {
        const stored = localStorage.getItem(this.getStorageKey('plans'))
        return stored ? JSON.parse(stored) : []
      } catch (error) {
        console.error('Error loading plans from localStorage:', error)
        return []
      }
    }

    const { data, error } = await this.supabase
      .from('plans')
      .select('*')
      .eq('user_id', userId!)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching plans:', error)
      return []
    }

    // Map database fields to app expected format with defaults
    const mappedPlans = (data as any[] || []).map((item: any) => ({
      id: item.id.toString(),
      title: item.title,
      description: item.description,
      category: 'general',
      priority: 'medium',
      date: item.created_at,
      completed: false,
      created_at: item.created_at,
      updated_at: item.updated_at
    }))

    return mappedPlans as any[]
  }

  async savePlan(userId: string | null, plan: Omit<Plan, 'id' | 'created_at' | 'updated_at'>): Promise<Plan | null> {
    if (!this.isAuthenticated(userId)) {
      // Fallback to localStorage for unauthenticated users
      try {
        const plans = await this.getPlans(null)
        const newPlan: Plan = {
          ...plan,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        const updatedPlans = [newPlan, ...plans]
        localStorage.setItem(this.getStorageKey('plans'), JSON.stringify(updatedPlans))
        return newPlan
      } catch (error) {
        console.error('Error saving plan to localStorage:', error)
        return null
      }
    }

    // Ensure user exists before saving plan
    const userExists = await this.ensureUserExists(userId!, 'itsdjbeazy@gmail.com')
    if (!userExists) {
      console.error('[DataService] Failed to ensure user exists for plan')
      return null
    }

    // Use only basic columns that exist
    const insertData = {
      title: plan.title,
      description: plan.description,
      user_id: userId
    }

    const { data, error } = await (this.supabase as any)
      .from('plans')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      console.error('Error saving plan:', error)
      return null
    }

    // Map database fields back to app expected format with defaults
    const mappedPlan: Plan = {
      id: data.id.toString(),
      title: data.title,
      description: data.description,
      category: 'general',
      priority: 'medium',
      date: data.created_at,
      completed: false,
      created_at: data.created_at,
      updated_at: data.updated_at
    }

    return mappedPlan
  }

  async updatePlan(userId: string | null, id: string, plan: Partial<Plan>): Promise<Plan | null> {
    if (!this.isAuthenticated(userId)) {
      // Fallback to localStorage for unauthenticated users
      try {
        const plans = await this.getPlans(null)
        const planIndex = plans.findIndex(p => p.id === id)
        if (planIndex === -1) return null
        
        const updatedPlan = {
          ...plans[planIndex],
          ...plan,
          updated_at: new Date().toISOString()
        }
        plans[planIndex] = updatedPlan
        localStorage.setItem(this.getStorageKey('plans'), JSON.stringify(plans))
        return updatedPlan
      } catch (error) {
        console.error('Error updating plan in localStorage:', error)
        return null
      }
    }

    const { data, error } = await (this.supabase as any)
      .from('plans')
      .update({
        ...plan,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId!)
      .select()
      .single()

    if (error) {
      console.error('Error updating plan:', error)
      return null
    }

    return data
  }

  async deletePlan(userId: string | null, id: string): Promise<boolean> {
    if (!this.isAuthenticated(userId)) {
      // Fallback to localStorage for unauthenticated users
      try {
        const plans = await this.getPlans(null)
        const filteredPlans = plans.filter(p => p.id !== id)
        localStorage.setItem(this.getStorageKey('plans'), JSON.stringify(filteredPlans))
        return true
      } catch (error) {
        console.error('Error deleting plan from localStorage:', error)
        return false
      }
    }

    const { error } = await this.supabase
      .from('plans')
      .delete()
      .eq('id', id)
      .eq('user_id', userId!)

    if (error) {
      console.error('Error deleting plan:', error)
      return false
    }

    return true
  }

  async getAppSettings(userId: string | null): Promise<AppSettings | null> {
    if (!this.isAuthenticated(userId)) {
      // Fallback to localStorage for unauthenticated users
      try {
        const stored = localStorage.getItem(this.getStorageKey('app-settings'))
        return stored ? JSON.parse(stored) : null
      } catch (error) {
        console.error('Error loading app settings from localStorage:', error)
        return null
      }
    }

    try {
      const { data, error } = await this.supabase
        .from('app_settings')
        .select('*')
        .eq('user_id', userId!)
        .single()

      if (error) {
        // Handle common error cases and fall back to localStorage
        if (error.code === 'PGRST116' || error.code === 'PGRST301' || (error as any).status === 406) {
          // Table doesn't exist, no rows found, or not acceptable - use localStorage fallback
          console.log('[DataService] Database table not available, falling back to localStorage for app settings')
          try {
            const stored = localStorage.getItem(this.getStorageKey('app-settings'))
            return stored ? JSON.parse(stored) : null
          } catch (localError) {
            console.error('Error loading app settings from localStorage fallback:', localError)
            return null
          }
        }
        console.error('Error fetching app settings:', error)
        return null
      }

      return data
    } catch (networkError) {
      // Network or other errors - fail silently and use localStorage fallback
      console.warn('Network error fetching app settings, using localStorage fallback')
      try {
        const stored = localStorage.getItem(this.getStorageKey('app-settings'))
        return stored ? JSON.parse(stored) : null
      } catch (error) {
        return null
      }
    }
  }

  async saveAppSettings(userId: string | null, settings: AppSettings): Promise<AppSettings | null> {
    if (!this.isAuthenticated(userId)) {
      // Fallback to localStorage for unauthenticated users
      try {
        const settingsWithTimestamps: AppSettings = {
          ...settings,
          id: settings.id || Date.now().toString(),
          created_at: settings.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        localStorage.setItem(this.getStorageKey('app-settings'), JSON.stringify(settingsWithTimestamps))
        return settingsWithTimestamps
      } catch (error) {
        console.error('Error saving app settings to localStorage:', error)
        return null
      }
    }

    try {
      const existingSettings = await this.getAppSettings(userId)

      if (existingSettings) {
        const { data, error } = await (this.supabase as any)
          .from('app_settings')
          .update({
            ...settings,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId!)
          .select()
          .single()

        if (error) {
          throw error
        }

        return data
      } else {
        const { data, error } = await (this.supabase as any)
          .from('app_settings')
          .insert([
            {
              ...settings,
              user_id: userId
            }
          ])
          .select()
          .single()

        if (error) {
          throw error
        }

        return data
      }
    } catch (error) {
      // Database operations failed, fall back to localStorage
      console.log('[DataService] Database save failed, falling back to localStorage for app settings:', error)
      try {
        const settingsWithTimestamps: AppSettings = {
          ...settings,
          id: settings.id || Date.now().toString(),
          created_at: settings.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        localStorage.setItem(this.getStorageKey('app-settings'), JSON.stringify(settingsWithTimestamps))
        return settingsWithTimestamps
      } catch (localError) {
        console.error('Error saving app settings to localStorage fallback:', localError)
        return null
      }
    }
  }

  private isLocalStorageDataMoreComplete(localData: PartnerProfile, dbData: PartnerProfile | null): boolean {
    if (!dbData) return true
    
    // Check if localStorage has more meaningful data
    const localHasRealData = localData.favoriteColor !== 'Unknown' || 
                             localData.favoriteFood !== 'Unknown' || 
                             (localData.favoriteHobbies && localData.favoriteHobbies.length > 0) ||
                             (localData.importantDates && localData.importantDates.length > 0) ||
                             (localData.notes && localData.notes.trim() !== '')
    
    const dbHasRealData = dbData.favoriteColor !== 'Unknown' || 
                          dbData.favoriteFood !== 'Unknown' || 
                          (dbData.favoriteHobbies && dbData.favoriteHobbies.length > 0) ||
                          (dbData.importantDates && dbData.importantDates.length > 0) ||
                          (dbData.notes && dbData.notes.trim() !== '')
    
    return Boolean(localHasRealData && !dbHasRealData)
  }

  private mergePartnerProfiles(localData: PartnerProfile, dbData: PartnerProfile | null): PartnerProfile {
    if (!dbData) return localData
    
    // Merge data, preferring non-"Unknown" values from localStorage
    return {
      ...dbData,
      favoriteColor: localData.favoriteColor !== 'Unknown' ? localData.favoriteColor : dbData.favoriteColor,
      favoriteFood: localData.favoriteFood !== 'Unknown' ? localData.favoriteFood : dbData.favoriteFood,
      favoriteHobbies: localData.favoriteHobbies && localData.favoriteHobbies.length > 0 ? localData.favoriteHobbies : dbData.favoriteHobbies,
      importantDates: localData.importantDates && localData.importantDates.length > 0 ? localData.importantDates : dbData.importantDates,
      notes: localData.notes && localData.notes.trim() !== '' ? localData.notes : dbData.notes,
      // Keep database metadata
      id: dbData.id,
      created_at: dbData.created_at,
      updated_at: dbData.updated_at
    }
  }
}

export const dataService = new DataService()
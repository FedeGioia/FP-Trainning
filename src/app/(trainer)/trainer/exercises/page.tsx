import Link from 'next/link'
import type { CSSProperties } from 'react'

import { BACKFILL_CATEGORY_NAME, listCategoryTree, listExercises } from '@/modules/exercises'
import { TrainerAction, TrainerEmptyState, TrainerMetricCard, TrainerNotice, TrainerPageHeader } from '@/components/trainer-ui'

import { createCategoryAction, deleteCategoryAction, updateExerciseCategoryAction } from './actions'

type TrainerExercisesPageProps = {
  searchParams?: Promise<{
    created?: string
    categoryCreated?: string
    categoryDeleted?: string
    categoryError?: string
    exerciseCategoryUpdated?: string
    category?: string
  }>
}

export default async function TrainerExercisesPage({ searchParams }: TrainerExercisesPageProps) {
  const params = (await searchParams) ?? {}
  const [exercises, categoryTree] = await Promise.all([listExercises(), listCategoryTree()])
  const categories = categoryTree.flatMap(function flatten(category): typeof categoryTree {
    return [category, ...category.children.flatMap(flatten)]
  })
  const exercisesByCategory = new Map<string, typeof exercises>()
  for (const exercise of exercises) {
    exercisesByCategory.set(exercise.categoryId, [...(exercisesByCategory.get(exercise.categoryId) ?? []), exercise])
  }
  const categoryGroups = categories
    .map((category) => ({ id: category.id, path: category.path, exercises: exercisesByCategory.get(category.id) ?? [] }))
    .filter((category) => category.exercises.length > 0)
  const defaultCategory = categoryGroups[0] ?? categories[0]
  const selectedCategory = categories.find((category) => category.id === params.category) ?? defaultCategory
  const selectedExercises = selectedCategory ? exercisesByCategory.get(selectedCategory.id) ?? [] : []
  const selectedWithVideo = selectedExercises.filter((exercise) => exercise.hasVideo).length
  const selectedMetricTypes = new Set(selectedExercises.map((exercise) => exercise.primaryMetricType)).size

  return (
    <div className="exercise-library">
      <aside className="exercise-library__categories" aria-label="Gestión de categorías">
        <div className="exercise-library__categories-header trainer-page-header">
          <div>
            <p className="exercise-library__eyebrow">Organización</p>
            <h1>Categorías</h1>
          </div>
          <details className="exercise-library__new-category">
            <summary>Nueva categoría</summary>
              <form action={createCategoryAction} className="exercise-library__category-form">
                {selectedCategory ? <input name="returnCategory" type="hidden" value={selectedCategory.id} /> : null}
                <label><span>Nombre</span><input name="name" type="text" required placeholder="Ej: Fuerza" /></label>
              <label><span>Dentro de</span><select name="parentId" defaultValue=""><option value="">Carpeta raíz</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.path}</option>)}</select></label>
              <button type="submit">Crear categoría</button>
            </form>
          </details>
        </div>

        <div className="exercise-library__category-list">
          {categories.length === 0 ? <TrainerEmptyState className="exercise-library__empty">Todavía no hay categorías. Podés crear una o seguir usando la biblioteca.</TrainerEmptyState> : categories.map((category) => {
            const level = category.path.split(' / ').length - 1
            const protectedCategory = category.name === BACKFILL_CATEGORY_NAME && category.parentId === null
            return (
              <article key={category.id} className={`exercise-library__category${category.id === selectedCategory?.id ? ' exercise-library__category--selected' : ''}`} style={{ '--category-level': level } as CSSProperties}>
                <Link className="exercise-library__category-link" href={`/trainer/exercises?category=${encodeURIComponent(category.id)}`} aria-current={category.id === selectedCategory?.id ? 'page' : undefined}>
                  <div className="exercise-library__category-name"><span aria-hidden="true">▰</span><strong>{category.name}</strong></div>
                  <small>{category.path}</small>
                </Link>
                <div className="exercise-library__category-actions">
                  <details>
                    <summary>+ Subcategoría</summary>
                    <form action={createCategoryAction} className="exercise-library__child-form">
                      <input name="parentId" type="hidden" value={category.id} />
                      {selectedCategory ? <input name="returnCategory" type="hidden" value={selectedCategory.id} /> : null}
                      <input name="name" type="text" required placeholder={`Dentro de ${category.name}`} aria-label={`Nueva subcategoría dentro de ${category.path}`} />
                      <button type="submit">Agregar</button>
                    </form>
                  </details>
                  {protectedCategory ? <span className="exercise-library__locked">Respaldo</span> : <form action={deleteCategoryAction}><input name="categoryId" type="hidden" value={category.id} />{selectedCategory ? <input name="returnCategory" type="hidden" value={selectedCategory.id} /> : null}<button className="exercise-library__delete" type="submit">Eliminar</button></form>}
                </div>
              </article>
            )
          })}
        </div>
      </aside>

      <section className="exercise-library__catalog">
        <TrainerPageHeader
          className="exercise-library__header"
          eyebrow="Biblioteca"
          title="Ejercicios"
          titleAs="h2"
          description="Gestioná y organizá tu catálogo de ejercicios."
          actions={<><label className="exercise-library__search"><span aria-hidden="true">⌕</span><span className="sr-only">Buscar ejercicios</span><input type="search" placeholder="Buscar ejercicios..." /></label><TrainerAction className="exercise-library__new-exercise" href="/trainer/exercises/new" variant="primary"><span aria-hidden="true">+</span> Nuevo ejercicio</TrainerAction></>}
        />

        {(params.created || params.categoryCreated || params.categoryDeleted || params.exerciseCategoryUpdated || params.categoryError) ? <div className="exercise-library__feedback" aria-live="polite">
          {params.created ? <TrainerNotice className="exercise-library__notice exercise-library__notice--ok">Ejercicio creado correctamente.</TrainerNotice> : null}
          {params.categoryCreated ? <TrainerNotice className="exercise-library__notice exercise-library__notice--ok">Categoría creada correctamente.</TrainerNotice> : null}
          {params.categoryDeleted ? <TrainerNotice className="exercise-library__notice exercise-library__notice--ok">Categoría eliminada; sus ejercicios se reasignaron a Sin categoría.</TrainerNotice> : null}
          {params.exerciseCategoryUpdated ? <TrainerNotice className="exercise-library__notice exercise-library__notice--ok">Categoría del ejercicio actualizada.</TrainerNotice> : null}
          {params.categoryError ? <TrainerNotice className="exercise-library__notice exercise-library__notice--error" tone="error">{decodeURIComponent(params.categoryError)}</TrainerNotice> : null}
        </div> : null}

        <div className="exercise-library__stats" aria-label="Resumen de la biblioteca">
          <TrainerMetricCard as="div"><span className="exercise-library__stat-icon">▤</span><p>Total de ejercicios<strong>{selectedExercises.length}</strong></p></TrainerMetricCard>
          <TrainerMetricCard as="div"><span className="exercise-library__stat-icon exercise-library__stat-icon--muted">▶</span><p>Con video<strong>{selectedWithVideo}</strong></p></TrainerMetricCard>
          <TrainerMetricCard as="div"><span className="exercise-library__stat-icon exercise-library__stat-icon--muted">◫</span><p>Tipos activos<strong>{selectedMetricTypes}</strong></p></TrainerMetricCard>
        </div>

        <div className="exercise-library__content">
          {!selectedCategory ? <TrainerEmptyState className="exercise-library__empty">Todavía no hay categorías. Creá una categoría o agregá tu primer ejercicio para empezar a armar la biblioteca.</TrainerEmptyState> : <section className="exercise-library__group">
              <h3>{selectedCategory.path}</h3>
              {selectedExercises.length === 0 ? <TrainerEmptyState className="exercise-library__empty">Esta categoría todavía no tiene ejercicios.</TrainerEmptyState> :
              <div className="exercise-library__grid">
                {selectedExercises.map((exercise) => <article key={exercise.id} className="exercise-library__card">
                  <div className="exercise-library__card-body">
                    <div className="exercise-library__card-meta"><span>{exercise.primaryMetricType}</span>{exercise.hasVideo ? <span className="exercise-library__video-indicator" title="Con video">▶</span> : null}</div>
                    <h4>{exercise.name}</h4>
                    <p>{exercise.description ?? 'Sin descripción todavía.'}</p>
                    <span className="exercise-library__tag">{exercise.categoryPath}</span>
                  </div>
                  <form action={updateExerciseCategoryAction} className="exercise-library__assignment">
                    <input name="exerciseId" type="hidden" value={exercise.id} />
                    <input name="returnCategory" type="hidden" value={selectedCategory.id} />
                    <label><span className="sr-only">Categoría para {exercise.name}</span><select name="categoryId" required defaultValue={exercise.categoryId}>{categories.map((item) => <option key={item.id} value={item.id}>{item.path}</option>)}</select></label>
                    <button type="submit">Guardar</button>
                  </form>
                </article>)}
              </div>
              }
            </section>}
        </div>
      </section>
    </div>
  )
}

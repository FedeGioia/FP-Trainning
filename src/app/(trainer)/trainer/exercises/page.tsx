import Link from 'next/link'

import { ExerciseCard } from '@/components/ui/exercise-card'
import { SectionIntro } from '@/components/ui/section-intro'
import { StatCard } from '@/components/ui/stat-card'
import { listCategoryTree, listExercises } from '@/modules/exercises'

import { createCategoryAction, deleteCategoryAction, updateExerciseCategoryAction } from './actions'

type TrainerExercisesPageProps = {
  searchParams?: Promise<{
    created?: string
    categoryCreated?: string
    categoryDeleted?: string
    categoryError?: string
    exerciseCategoryUpdated?: string
  }>
}

export default async function TrainerExercisesPage({ searchParams }: TrainerExercisesPageProps) {
  const params = (await searchParams) ?? {}
  const [exercises, categoryTree] = await Promise.all([listExercises(), listCategoryTree()])
  const withVideo = exercises.filter((exercise) => exercise.hasVideo).length
  const categories = categoryTree.flatMap(function flatten(category): typeof categoryTree {
    return [category, ...category.children.flatMap(flatten)]
  })
  const exercisesByCategory = new Map<string, typeof exercises>()
  for (const exercise of exercises) {
    const categoryId = exercise.categoryId ?? 'uncategorized'
    exercisesByCategory.set(categoryId, [...(exercisesByCategory.get(categoryId) ?? []), exercise])
  }
  const categoryGroups = [
    ...categories.map((category) => ({ id: category.id, path: category.path, exercises: exercisesByCategory.get(category.id) ?? [] })),
    { id: 'uncategorized', path: 'Sin categoría', exercises: exercisesByCategory.get('uncategorized') ?? [] },
  ].filter((category) => category.exercises.length > 0)

  return (
    <div className="stack">
      <SectionIntro
        eyebrow="Biblioteca"
        title="Ejercicios"
        description="Centralizá los ejercicios que usás en cada programa para reutilizarlos al crear plantillas y bloques."
        actions={
          <>
            <Link className="button button-primary" href="/trainer/exercises/new">
              Nuevo ejercicio
            </Link>
            <Link className="button button-secondary" href="/trainer">
              Volver al dashboard
            </Link>
          </>
        }
      />

      {params.created ? <span className="status status--ok">Ejercicio creado correctamente.</span> : null}
      {params.categoryCreated ? <span className="status status--ok">Categoría creada correctamente.</span> : null}
      {params.categoryDeleted ? <span className="status status--ok">Categoría eliminada; sus ejercicios quedaron sin categoría.</span> : null}
      {params.exerciseCategoryUpdated ? <span className="status status--ok">Categoría del ejercicio actualizada.</span> : null}
      {params.categoryError ? <span className="status status--error">{decodeURIComponent(params.categoryError)}</span> : null}

      <div className="grid cards">
        <StatCard label="Ejercicios visibles" value={exercises.length} detail="Catálogo actual disponible" />
        <StatCard label="Con video" value={withVideo} detail="Útiles para guía del alumno" />
        <StatCard label="Tipos activos" value="4" detail="Strength, duration, distance y custom" />
      </div>

      <section className="card stack">
        <div className="section-header">
          <div>
            <h2 className="section-title">Carpetas de categorías</h2>
            <p className="muted">Creá carpetas raíz o elegí una existente como padre para anidarlas.</p>
          </div>
        </div>
        <form action={createCategoryAction} className="form-grid">
          <label className="field">
            <span>Nueva categoría</span>
            <input name="name" type="text" required placeholder="Ej: Fuerza" />
          </label>
          <label className="field">
            <span>Dentro de</span>
            <select name="parentId" defaultValue="">
              <option value="">Carpeta raíz</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.path}</option>)}
            </select>
          </label>
          <button className="button button-primary" type="submit">Crear categoría</button>
        </form>
        {categories.length === 0 ? (
          <p className="status status--muted">Todavía no hay categorías. Los ejercicios sin carpeta siguen disponibles.</p>
        ) : (
          <ul className="category-tree">
            {categories.map((category) => (
              <li key={category.id} className="category-tree__item" style={{ marginLeft: `${category.path.split(' / ').length - 1}rem` }}>
                <div className="category-tree__content">
                  <span>{category.path}</span>
                  <details>
                    <summary>Agregar subcategoría</summary>
                    <form action={createCategoryAction} className="category-tree__child-form">
                      <input name="parentId" type="hidden" value={category.id} />
                      <input name="name" type="text" required placeholder={`Dentro de ${category.name}`} aria-label={`Nueva subcategoría dentro de ${category.path}`} />
                      <button className="button button-primary" type="submit">Agregar</button>
                    </form>
                  </details>
                </div>
                <form action={deleteCategoryAction}>
                  <input name="categoryId" type="hidden" value={category.id} />
                  <button className="button button-secondary category-tree__delete" type="submit">Eliminar</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="stack">
        <div className="section-header">
          <div>
            <h2 className="section-title">Catálogo visible</h2>
            <p className="muted">Revisá tu biblioteca actual y sumá nuevos ejercicios cuando lo necesites.</p>
          </div>
        </div>

        {categoryGroups.map((category) => (
          <section key={category.id} className="stack">
            <h3 className="section-title">{category.path}</h3>
            <div className="grid cards">
              {category.exercises.map((exercise) => (
                <div key={exercise.id} className="stack">
                  <ExerciseCard exercise={exercise} />
                  <form action={updateExerciseCategoryAction} className="exercise-category-assignment">
                    <input name="exerciseId" type="hidden" value={exercise.id} />
                    <label>
                      <span className="sr-only">Categoría para {exercise.name}</span>
                      <select name="categoryId" defaultValue={exercise.categoryId ?? ''}>
                        <option value="">Sin categoría</option>
                        {categories.map((category) => <option key={category.id} value={category.id}>{category.path}</option>)}
                      </select>
                    </label>
                    <button className="button button-secondary" type="submit">Guardar categoría</button>
                  </form>
                </div>
              ))}
            </div>
          </section>
        ))}
      </section>
    </div>
  )
}
